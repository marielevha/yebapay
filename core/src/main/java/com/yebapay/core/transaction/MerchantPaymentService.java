package com.yebapay.core.transaction;

import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.fee.FeeEngineService;
import com.yebapay.core.fee.FeeQuote;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.merchant.MerchantProfile;
import com.yebapay.core.merchant.MerchantService;
import com.yebapay.core.qr.QrService;
import com.yebapay.core.qr.QrToken;
import com.yebapay.core.qr.QrType;
import com.yebapay.core.transaction.dto.MerchantPaymentQuoteRequest;
import com.yebapay.core.transaction.dto.MerchantPaymentQuoteResponse;
import com.yebapay.core.transaction.dto.MerchantPaymentRequest;
import com.yebapay.core.transaction.dto.MerchantPaymentResponse;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletLimitService;
import com.yebapay.core.wallet.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MerchantPaymentService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final MerchantService merchantService;
    private final QrService qrService;
    private final TransactionPinService transactionPinService;
    private final FeeEngineService feeEngineService;
    private final WalletLimitService walletLimitService;
    private final WalletPaymentExecutionService walletPaymentExecutionService;
    private final CurrencyMetadataResolver currencyMetadataResolver;

    @Transactional(readOnly = true)
    public MerchantPaymentQuoteResponse quote(UUID payerUserId, MerchantPaymentQuoteRequest request) {
        User payer = requireActiveUser(payerUserId);
        QrToken qrToken = qrService.requireUsableQr(request.qrData(), QrType.MERCHANT_STATIC);
        MerchantProfile merchantProfile = resolveMerchantProfile(qrToken);
        Wallet payerWallet = walletService.getActivePersonalWalletForUser(payerUserId);
        BigDecimal amount = normalizeAmount(request.amount());

        if (merchantProfile.getUser().getId().equals(payerUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot pay your own merchant wallet");
        }

        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.MERCHANT_PAYMENT.name(),
            payerWallet.getCurrencyCode(),
            "CUSTOMER",
            "MERCHANT",
            merchantProfile.getMerchantCategoryCode(),
            amount
        );
        walletLimitService.assertCanDebit(payerWallet, feeQuote.totalDebit());
        CurrencyMetadata currency = currencyMetadataResolver.resolve(payerWallet.getCurrencyCode());

        return new MerchantPaymentQuoteResponse(
            merchantProfile.getMerchantCode(),
            merchantDisplayName(merchantProfile),
            payerWallet.getWalletNumber(),
            qrToken.getTargetWallet() == null ? null : qrToken.getTargetWallet().getWalletNumber(),
            amount,
            feeQuote.feeAmount(),
            feeQuote.totalDebit(),
            feeQuote.netAmount(),
            payerWallet.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            normalize(request.description())
        );
    }

    @Transactional
    public MerchantPaymentResponse pay(UUID payerUserId, MerchantPaymentRequest request) {
        String normalizedIdempotencyKey = request.idempotencyKey().trim();
        Transaction existingTransaction = transactionRepository.findByIdempotencyKey(normalizedIdempotencyKey).orElse(null);
        if (existingTransaction != null) {
            if (existingTransaction.getInitiatorUser() == null
                || !payerUserId.equals(existingTransaction.getInitiatorUser().getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Idempotency key is already in use");
            }
            return toResponse(existingTransaction);
        }

        User payer = requireActiveUser(payerUserId);
        transactionPinService.validateOrThrow(payerUserId, request.pin());

        QrToken qrToken = qrService.requireUsableQr(request.qrData(), QrType.MERCHANT_STATIC);
        MerchantProfile merchantProfile = resolveMerchantProfile(qrToken);
        Wallet payerWallet = walletService.getActivePersonalWalletForUser(payerUserId);
        Wallet merchantWallet = qrToken.getTargetWallet();
        BigDecimal amount = normalizeAmount(request.amount());

        if (merchantProfile.getUser().getId().equals(payerUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot pay your own merchant wallet");
        }

        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.MERCHANT_PAYMENT.name(),
            payerWallet.getCurrencyCode(),
            "CUSTOMER",
            "MERCHANT",
            merchantProfile.getMerchantCategoryCode(),
            amount
        );
        walletLimitService.assertCanDebit(payerWallet, feeQuote.totalDebit());

        Transaction transaction = walletPaymentExecutionService.execute(new WalletPaymentCommand(
            TransactionType.MERCHANT_PAYMENT,
            TransactionChannel.QR,
            payerWallet,
            merchantWallet,
            payer,
            payer,
            merchantProfile.getUser(),
            merchantProfile,
            qrToken,
            null,
            normalizedIdempotencyKey,
            amount,
            feeQuote,
            normalize(request.description())
        ));

        qrService.markUsed(qrToken);
        return toResponse(transaction);
    }

    private MerchantProfile resolveMerchantProfile(QrToken qrToken) {
        if (qrToken.getTargetWallet() == null || qrToken.getBeneficiaryUser() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Merchant QR is incomplete");
        }
        return merchantService.getActiveMerchantProfileForUser(qrToken.getBeneficiaryUser().getId());
    }

    private User requireActiveUser(UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }
        return user;
    }

    private MerchantPaymentResponse toResponse(Transaction transaction) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(transaction.getCurrencyCode());
        MerchantProfile merchantProfile = transaction.getMerchantProfile();
        BigDecimal totalDebit = transaction.getAmount().add(
            transaction.getFeeBearer() == TransactionFeeBearer.PAYER
                ? transaction.getFeeAmount()
                : BigDecimal.ZERO
        );

        return new MerchantPaymentResponse(
            transaction.getId(),
            transaction.getTransactionRef(),
            transaction.getStatus(),
            merchantProfile == null ? null : merchantProfile.getMerchantCode(),
            merchantProfile == null ? null : merchantDisplayName(merchantProfile),
            transaction.getSourceWallet() == null ? null : transaction.getSourceWallet().getWalletNumber(),
            transaction.getDestinationWallet() == null ? null : transaction.getDestinationWallet().getWalletNumber(),
            transaction.getAmount(),
            transaction.getFeeAmount(),
            totalDebit,
            transaction.getNetAmount(),
            transaction.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            transaction.getDescription(),
            transaction.getCompletedAt()
        );
    }

    private String merchantDisplayName(MerchantProfile merchantProfile) {
        if (merchantProfile.getDisplayName() != null && !merchantProfile.getDisplayName().isBlank()) {
            return merchantProfile.getDisplayName();
        }
        return merchantProfile.getBusinessName();
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
}
