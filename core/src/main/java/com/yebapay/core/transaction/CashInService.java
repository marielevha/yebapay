package com.yebapay.core.transaction;

import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.fee.FeeEngineService;
import com.yebapay.core.fee.FeeQuote;
import com.yebapay.core.identity.RoleCode;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.ledger.LedgerAccount;
import com.yebapay.core.ledger.LedgerAccountPurpose;
import com.yebapay.core.ledger.LedgerAccountService;
import com.yebapay.core.transaction.dto.CashInQuoteRequest;
import com.yebapay.core.transaction.dto.CashInQuoteResponse;
import com.yebapay.core.transaction.dto.CashInRequest;
import com.yebapay.core.transaction.dto.CashInResponse;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletBalanceSnapshotType;
import com.yebapay.core.wallet.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.LinkedHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CashInService {

    private final TransactionRepository transactionRepository;
    private final TransactionStatusHistoryRepository transactionStatusHistoryRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final LedgerAccountService ledgerAccountService;
    private final FeeEngineService feeEngineService;
    private final TransactionPinService transactionPinService;
    private final CurrencyMetadataResolver currencyMetadataResolver;

    @Transactional(readOnly = true)
    public CashInQuoteResponse quote(AuthenticatedUser principal, CashInQuoteRequest request) {
        User actor = requireActiveUser(principal.getUserId());
        Wallet targetWallet = resolveTargetWallet(actor, principal, request.targetPhoneNumber());
        BigDecimal amount = normalizeAmount(request.amount());
        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.CASH_IN.name(),
            targetWallet.getCurrencyCode(),
            "CUSTOMER",
            "CUSTOMER",
            null,
            amount
        );
        CurrencyMetadata currency = currencyMetadataResolver.resolve(targetWallet.getCurrencyCode());

        return new CashInQuoteResponse(
            targetWallet.getOwnerUser().getDisplayName(),
            targetWallet.getWalletNumber(),
            amount,
            feeQuote.feeAmount(),
            feeQuote.netAmount(),
            targetWallet.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName()
        );
    }

    @Transactional
    public CashInResponse execute(AuthenticatedUser principal, CashInRequest request) {
        String normalizedIdempotencyKey = request.idempotencyKey().trim();
        Transaction existingTransaction = transactionRepository.findByIdempotencyKey(normalizedIdempotencyKey).orElse(null);
        if (existingTransaction != null) {
            if (existingTransaction.getInitiatorUser() == null
                || !principal.getUserId().equals(existingTransaction.getInitiatorUser().getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Idempotency key is already in use");
            }
            return toResponse(existingTransaction);
        }

        User actor = requireActiveUser(principal.getUserId());
        transactionPinService.validateOrThrow(actor.getId(), request.pin());

        Wallet targetWallet = resolveTargetWallet(actor, principal, request.targetPhoneNumber());
        BigDecimal amount = normalizeAmount(request.amount());
        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.CASH_IN.name(),
            targetWallet.getCurrencyCode(),
            "CUSTOMER",
            "CUSTOMER",
            null,
            amount
        );

        Wallet lockedTargetWallet = walletService.lockWallet(targetWallet.getId());
        LedgerAccount clearingAccount = ledgerAccountService.getOrCreateLockedSystemAccount(
            LedgerAccountPurpose.PLATFORM_CASH_IN_CLEARING,
            lockedTargetWallet.getCurrencyCode()
        );
        LedgerAccount destinationAccount = ledgerAccountService.getOrCreateLockedWalletMainAccount(lockedTargetWallet);

        Instant now = Instant.now();
        Transaction transaction = transactionRepository.save(Transaction.builder()
            .transactionRef(generateTransactionRef())
            .transactionType(TransactionType.CASH_IN)
            .channel(TransactionChannel.API)
            .status(TransactionStatus.INITIATED)
            .destinationWallet(lockedTargetWallet)
            .initiatorUser(actor)
            .payerUser(actor.getId().equals(lockedTargetWallet.getOwnerUser().getId()) ? null : actor)
            .payeeUser(lockedTargetWallet.getOwnerUser())
            .idempotencyKey(normalizedIdempotencyKey)
            .amount(amount)
            .feeAmount(feeQuote.feeAmount())
            .netAmount(feeQuote.netAmount())
            .currencyCode(lockedTargetWallet.getCurrencyCode())
            .feeBearer(feeQuote.feeBearer())
            .description(normalize(request.description()))
            .initiatedAt(now)
            .metadata(new LinkedHashMap<>())
            .build());

        recordStatusChange(transaction, null, TransactionStatus.INITIATED, actor, "CASH_IN_CREATED");

        lockedTargetWallet.setAvailableBalance(lockedTargetWallet.getAvailableBalance().add(feeQuote.netAmount()));
        lockedTargetWallet.setLedgerBalance(lockedTargetWallet.getLedgerBalance().add(feeQuote.netAmount()));
        lockedTargetWallet.setLastActivityAt(now);

        ledgerAccountService.postCashIn(
            transaction,
            clearingAccount,
            destinationAccount,
            feeQuote.netAmount(),
            transaction.getDescription() == null ? "Cash-in to " + lockedTargetWallet.getWalletNumber() : transaction.getDescription()
        );

        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setConfirmedAt(now);
        transaction.setCompletedAt(now);
        transactionRepository.save(transaction);
        recordStatusChange(transaction, TransactionStatus.INITIATED, TransactionStatus.COMPLETED, actor, "CASH_IN_POSTED");

        walletService.snapshot(lockedTargetWallet, WalletBalanceSnapshotType.CASH_IN_POSTED);
        return toResponse(transaction);
    }

    private Wallet resolveTargetWallet(User actor, AuthenticatedUser principal, String targetPhoneNumber) {
        String normalizedPhone = normalize(targetPhoneNumber);
        if (normalizedPhone == null) {
            return walletService.getActivePersonalWalletForUser(actor.getId());
        }

        User targetUser = userRepository.findByPhoneNumberAndDeletedAtIsNull(normalizedPhone)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));
        if (targetUser.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user account is not active");
        }
        if (!targetUser.getId().equals(actor.getId())
            && !principal.getRoleCodes().contains(RoleCode.ADMIN)
            && !principal.getRoleCodes().contains(RoleCode.AGENT)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cash-in another user's wallet as an admin or agent");
        }
        return walletService.getActivePersonalWalletForUser(targetUser.getId());
    }

    private User requireActiveUser(java.util.UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }
        return user;
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

    private CashInResponse toResponse(Transaction transaction) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(transaction.getCurrencyCode());
        return new CashInResponse(
            transaction.getId(),
            transaction.getTransactionRef(),
            transaction.getStatus(),
            transaction.getPayeeUser() == null ? null : transaction.getPayeeUser().getDisplayName(),
            transaction.getDestinationWallet() == null ? null : transaction.getDestinationWallet().getWalletNumber(),
            transaction.getAmount(),
            transaction.getFeeAmount(),
            transaction.getNetAmount(),
            transaction.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            transaction.getCompletedAt()
        );
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be positive");
        }
        return amount.setScale(4, RoundingMode.HALF_UP);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String generateTransactionRef() {
        return "TXN-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 14).toUpperCase();
    }
}
