package com.yebapay.core.transaction;

import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.fee.FeeEngineService;
import com.yebapay.core.fee.FeeQuote;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.transaction.dto.P2pTransferQuoteRequest;
import com.yebapay.core.transaction.dto.P2pTransferQuoteResponse;
import com.yebapay.core.transaction.dto.P2pTransferRequest;
import com.yebapay.core.transaction.dto.P2pTransferResponse;
import com.yebapay.core.transaction.dto.TransactionSummaryResponse;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletLimitService;
import com.yebapay.core.wallet.WalletStatus;
import com.yebapay.core.wallet.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final WalletPaymentExecutionService walletPaymentExecutionService;
    private final FeeEngineService feeEngineService;
    private final TransactionPinService transactionPinService;
    private final WalletLimitService walletLimitService;
    private final CurrencyMetadataResolver currencyMetadataResolver;

    @Transactional(readOnly = true)
    public P2pTransferQuoteResponse quoteP2pTransfer(UUID initiatorUserId, P2pTransferQuoteRequest request) {
        TransferParticipants participants = resolveParticipants(initiatorUserId, request.destinationPhoneNumber());
        BigDecimal amount = normalizeAmount(request.amount());
        ensureTransferIsAllowed(participants.sourceWallet(), participants.destinationWallet(), amount);

        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.P2P_TRANSFER.name(),
            participants.sourceWallet().getCurrencyCode(),
            "CUSTOMER",
            "CUSTOMER",
            null,
            amount
        );
        walletLimitService.assertCanDebit(participants.sourceWallet(), feeQuote.totalDebit());
        CurrencyMetadata currency = currencyMetadataResolver.resolve(participants.sourceWallet().getCurrencyCode());

        return new P2pTransferQuoteResponse(
            participants.sourceWallet().getWalletNumber(),
            participants.destinationWallet().getWalletNumber(),
            participants.initiator().getDisplayName(),
            participants.recipient().getDisplayName(),
            amount,
            feeQuote.feeAmount(),
            feeQuote.totalDebit(),
            feeQuote.netAmount(),
            participants.sourceWallet().getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            normalizeDescription(request.description())
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionSummaryResponse> getRecentTransactions(
        UUID userId,
        int page,
        int size,
        UUID walletId,
        TransactionType transactionType
    ) {
        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 50);

        return transactionRepository.findRecentForUserFiltered(
                userId,
                walletId,
                transactionType,
                PageRequest.of(normalizedPage, normalizedSize)
            ).stream()
            .map(transaction -> toTransactionSummary(transaction, userId))
            .toList();
    }

    @Transactional
    public P2pTransferResponse executeP2pTransfer(UUID initiatorUserId, P2pTransferRequest request) {
        String normalizedIdempotencyKey = request.idempotencyKey().trim();
        Transaction existingTransaction = transactionRepository.findByIdempotencyKey(normalizedIdempotencyKey).orElse(null);

        if (existingTransaction != null) {
            if (existingTransaction.getInitiatorUser() == null
                || !initiatorUserId.equals(existingTransaction.getInitiatorUser().getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Idempotency key is already in use");
            }
            return toP2pTransferResponse(existingTransaction);
        }

        TransferParticipants participants = resolveParticipants(initiatorUserId, request.destinationPhoneNumber());
        BigDecimal amount = normalizeAmount(request.amount());
        ensureTransferIsAllowed(participants.sourceWallet(), participants.destinationWallet(), amount);
        transactionPinService.validateOrThrow(initiatorUserId, request.pin());

        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.P2P_TRANSFER.name(),
            participants.sourceWallet().getCurrencyCode(),
            "CUSTOMER",
            "CUSTOMER",
            null,
            amount
        );
        walletLimitService.assertCanDebit(participants.sourceWallet(), feeQuote.totalDebit());

        Transaction transaction = walletPaymentExecutionService.execute(new WalletPaymentCommand(
            TransactionType.P2P_TRANSFER,
            TransactionChannel.MOBILE_APP,
            participants.sourceWallet(),
            participants.destinationWallet(),
            participants.initiator(),
            participants.initiator(),
            participants.recipient(),
            null,
            null,
            null,
            normalizedIdempotencyKey,
            amount,
            feeQuote,
            normalizeDescription(request.description())
        ));

        return toP2pTransferResponse(transaction);
    }

    private TransferParticipants resolveParticipants(UUID initiatorUserId, String destinationPhoneNumber) {
        User initiator = userRepository.findByIdAndDeletedAtIsNull(initiatorUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Initiator not found"));
        User recipient = userRepository.findByPhoneNumberAndDeletedAtIsNull(normalizePhoneNumber(destinationPhoneNumber))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

        if (initiator.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Initiator account is not active");
        }
        if (recipient.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recipient account is not active");
        }
        if (initiator.getId().equals(recipient.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot transfer to your own wallet");
        }

        Wallet sourceWallet = walletService.getActivePersonalWalletForUser(initiator.getId());
        Wallet destinationWallet = walletService.getActivePersonalWalletForUser(recipient.getId());
        return new TransferParticipants(initiator, recipient, sourceWallet, destinationWallet);
    }

    private void ensureTransferIsAllowed(Wallet sourceWallet, Wallet destinationWallet, BigDecimal amount) {
        if (sourceWallet.getStatus() != WalletStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Source wallet is not active");
        }
        if (destinationWallet.getStatus() != WalletStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Destination wallet is not active");
        }
        if (!sourceWallet.getCurrencyCode().equals(destinationWallet.getCurrencyCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cross-currency transfer is not supported yet");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer amount must be positive");
        }
    }

    private TransactionSummaryResponse toTransactionSummary(Transaction transaction, UUID currentUserId) {
        boolean outgoing = transaction.getPayerUser() != null && currentUserId.equals(transaction.getPayerUser().getId());
        User counterparty = outgoing ? transaction.getPayeeUser() : transaction.getPayerUser();
        CurrencyMetadata currency = currencyMetadataResolver.resolve(transaction.getCurrencyCode());

        return new TransactionSummaryResponse(
            transaction.getId(),
            transaction.getTransactionRef(),
            transaction.getTransactionType(),
            transaction.getStatus(),
            outgoing ? "OUT" : "IN",
            transaction.getAmount(),
            transaction.getFeeAmount(),
            transaction.getNetAmount(),
            transaction.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            transaction.getSourceWallet() == null ? null : transaction.getSourceWallet().getWalletNumber(),
            transaction.getDestinationWallet() == null ? null : transaction.getDestinationWallet().getWalletNumber(),
            counterparty == null ? null : counterparty.getDisplayName(),
            counterparty == null ? null : counterparty.getPhoneNumber(),
            transaction.getDescription(),
            transaction.getInitiatedAt(),
            transaction.getCompletedAt()
        );
    }

    private P2pTransferResponse toP2pTransferResponse(Transaction transaction) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(transaction.getCurrencyCode());

        return new P2pTransferResponse(
            transaction.getId(),
            transaction.getTransactionRef(),
            transaction.getStatus(),
            transaction.getSourceWallet() == null ? null : transaction.getSourceWallet().getWalletNumber(),
            transaction.getDestinationWallet() == null ? null : transaction.getDestinationWallet().getWalletNumber(),
            transaction.getPayerUser() == null ? null : transaction.getPayerUser().getDisplayName(),
            transaction.getPayeeUser() == null ? null : transaction.getPayeeUser().getDisplayName(),
            transaction.getAmount(),
            transaction.getFeeAmount(),
            transaction.getAmount().add(
                transaction.getFeeBearer() == TransactionFeeBearer.PAYER
                    ? transaction.getFeeAmount()
                    : BigDecimal.ZERO
            ),
            transaction.getNetAmount(),
            transaction.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            transaction.getDescription(),
            transaction.getInitiatedAt(),
            transaction.getCompletedAt()
        );
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null ? null : phoneNumber.trim();
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }
        return amount.setScale(4, RoundingMode.HALF_UP);
    }

    private record TransferParticipants(
        User initiator,
        User recipient,
        Wallet sourceWallet,
        Wallet destinationWallet
    ) {
    }
}
