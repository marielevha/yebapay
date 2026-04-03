package com.yebapay.core.transaction;

import com.yebapay.core.fee.FeeEngineService;
import com.yebapay.core.fee.FeeQuote;
import com.yebapay.core.identity.User;
import com.yebapay.core.ledger.LedgerAccount;
import com.yebapay.core.ledger.LedgerAccountPurpose;
import com.yebapay.core.ledger.LedgerAccountService;
import com.yebapay.core.merchant.MerchantProfile;
import com.yebapay.core.qr.QrToken;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletBalanceSnapshotType;
import com.yebapay.core.wallet.WalletService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WalletPaymentExecutionService {

    private final TransactionRepository transactionRepository;
    private final TransactionStatusHistoryRepository transactionStatusHistoryRepository;
    private final LedgerAccountService ledgerAccountService;
    private final WalletService walletService;
    private final FeeEngineService feeEngineService;

    @Transactional
    public Transaction execute(WalletPaymentCommand command) {
        Wallet sourceWallet = command.sourceWallet();
        Wallet destinationWallet = command.destinationWallet();
        FeeQuote feeQuote = command.feeQuote();

        ensureTransferIsAllowed(sourceWallet, destinationWallet, command.amount(), feeQuote);

        Map<UUID, Wallet> lockedWallets = lockWallets(sourceWallet, destinationWallet);
        Wallet lockedSourceWallet = lockedWallets.get(sourceWallet.getId());
        Wallet lockedDestinationWallet = lockedWallets.get(destinationWallet.getId());

        ensureTransferIsAllowed(lockedSourceWallet, lockedDestinationWallet, command.amount(), feeQuote);
        if (lockedSourceWallet.getAvailableBalance().compareTo(feeQuote.totalDebit()) < 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Insufficient wallet balance");
        }

        LedgerAccount sourceLedgerAccount = ledgerAccountService.getOrCreateLockedWalletMainAccount(lockedSourceWallet);
        LedgerAccount destinationLedgerAccount = ledgerAccountService.getOrCreateLockedWalletMainAccount(lockedDestinationWallet);
        LedgerAccount feeRevenueAccount = feeQuote.feeAmount().compareTo(BigDecimal.ZERO) > 0
            ? ledgerAccountService.getOrCreateLockedSystemAccount(LedgerAccountPurpose.PLATFORM_FEE_REVENUE, lockedSourceWallet.getCurrencyCode())
            : null;

        Instant now = Instant.now();
        Transaction transaction = transactionRepository.save(Transaction.builder()
            .transactionRef(generateTransactionRef())
            .transactionType(command.transactionType())
            .channel(command.channel())
            .status(TransactionStatus.INITIATED)
            .sourceWallet(lockedSourceWallet)
            .destinationWallet(lockedDestinationWallet)
            .initiatorUser(command.initiatorUser())
            .payerUser(command.payerUser())
            .payeeUser(command.payeeUser())
            .merchantProfile(command.merchantProfile())
            .qrToken(command.qrToken())
            .moneyRequest(command.moneyRequest())
            .idempotencyKey(command.idempotencyKey())
            .amount(command.amount())
            .feeAmount(feeQuote.feeAmount())
            .netAmount(feeQuote.netAmount())
            .currencyCode(lockedSourceWallet.getCurrencyCode())
            .feeBearer(feeQuote.feeBearer())
            .description(command.description())
            .initiatedAt(now)
            .metadata(new LinkedHashMap<>())
            .build());

        recordStatusChange(transaction, null, TransactionStatus.INITIATED, command.initiatorUser(), "TRANSACTION_CREATED");

        lockedSourceWallet.setAvailableBalance(lockedSourceWallet.getAvailableBalance().subtract(feeQuote.totalDebit()));
        lockedSourceWallet.setLedgerBalance(lockedSourceWallet.getLedgerBalance().subtract(feeQuote.totalDebit()));
        lockedSourceWallet.setLastActivityAt(now);

        lockedDestinationWallet.setAvailableBalance(lockedDestinationWallet.getAvailableBalance().add(feeQuote.netAmount()));
        lockedDestinationWallet.setLedgerBalance(lockedDestinationWallet.getLedgerBalance().add(feeQuote.netAmount()));
        lockedDestinationWallet.setLastActivityAt(now);

        ledgerAccountService.postWalletToWalletTransfer(
            transaction,
            sourceLedgerAccount,
            destinationLedgerAccount,
            feeRevenueAccount,
            command.amount(),
            feeQuote.feeAmount(),
            feeQuote.feeBearer(),
            buildLedgerDescription(command.payerUser(), command.payeeUser(), command.description(), command.transactionType())
        );
        feeEngineService.persistAppliedFee(transaction, feeQuote, feeRevenueAccount);

        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setConfirmedAt(now);
        transaction.setCompletedAt(now);
        transactionRepository.save(transaction);
        recordStatusChange(transaction, TransactionStatus.INITIATED, TransactionStatus.COMPLETED, command.initiatorUser(), "TRANSACTION_POSTED");

        walletService.snapshot(lockedSourceWallet, WalletBalanceSnapshotType.TRANSFER_POSTED);
        walletService.snapshot(lockedDestinationWallet, WalletBalanceSnapshotType.TRANSFER_POSTED);

        return transaction;
    }

    private void ensureTransferIsAllowed(Wallet sourceWallet, Wallet destinationWallet, BigDecimal amount, FeeQuote feeQuote) {
        if (!sourceWallet.getCurrencyCode().equals(destinationWallet.getCurrencyCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cross-currency transfer is not supported yet");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be positive");
        }
        if (feeQuote.netAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Net amount must remain positive after fees");
        }
    }

    private void recordStatusChange(
        Transaction transaction,
        TransactionStatus fromStatus,
        TransactionStatus toStatus,
        User changedByUser,
        String reasonCode
    ) {
        transactionStatusHistoryRepository.save(TransactionStatusHistory.builder()
            .transaction(transaction)
            .fromStatus(fromStatus)
            .toStatus(toStatus)
            .changedByUser(changedByUser)
            .changeReasonCode(reasonCode)
            .changedAt(Instant.now())
            .metadata(new LinkedHashMap<>())
            .build());
    }

    private Map<UUID, Wallet> lockWallets(Wallet sourceWallet, Wallet destinationWallet) {
        Wallet firstWallet = sourceWallet.getId().compareTo(destinationWallet.getId()) <= 0 ? sourceWallet : destinationWallet;
        Wallet secondWallet = firstWallet.getId().equals(sourceWallet.getId()) ? destinationWallet : sourceWallet;

        Wallet lockedFirstWallet = walletService.lockWallet(firstWallet.getId());
        Wallet lockedSecondWallet = walletService.lockWallet(secondWallet.getId());

        return Map.of(
            lockedFirstWallet.getId(), lockedFirstWallet,
            lockedSecondWallet.getId(), lockedSecondWallet
        );
    }

    private String buildLedgerDescription(User payerUser, User payeeUser, String description, TransactionType transactionType) {
        if (description != null && !description.isBlank()) {
            return description;
        }
        String payer = payerUser == null ? "unknown" : payerUser.getPhoneNumber();
        String payee = payeeUser == null ? "unknown" : payeeUser.getPhoneNumber();
        return transactionType.name() + " from " + payer + " to " + payee;
    }

    private String generateTransactionRef() {
        return "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 14).toUpperCase();
    }
}
