package com.yebapay.core.transaction;

import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.fee.FeeEngineService;
import com.yebapay.core.fee.FeeQuote;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.qr.QrService;
import com.yebapay.core.qr.QrToken;
import com.yebapay.core.qr.QrTokenRepository;
import com.yebapay.core.qr.dto.QrTokenResponse;
import com.yebapay.core.transaction.dto.AcceptMoneyRequestRequest;
import com.yebapay.core.transaction.dto.CreateMoneyRequestRequest;
import com.yebapay.core.transaction.dto.MoneyRequestDetailsResponse;
import com.yebapay.core.transaction.dto.MoneyRequestPaymentResponse;
import com.yebapay.core.transaction.dto.MoneyRequestQuoteRequest;
import com.yebapay.core.transaction.dto.MoneyRequestQuoteResponse;
import com.yebapay.core.transaction.dto.MoneyRequestResponse;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletLimitService;
import com.yebapay.core.wallet.WalletService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MoneyRequestService {

    private static final Duration DEFAULT_EXPIRY = Duration.ofHours(24);

    private final MoneyRequestRepository moneyRequestRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final WalletLimitService walletLimitService;
    private final TransactionPinService transactionPinService;
    private final WalletPaymentExecutionService walletPaymentExecutionService;
    private final FeeEngineService feeEngineService;
    private final QrService qrService;
    private final QrTokenRepository qrTokenRepository;
    private final CurrencyMetadataResolver currencyMetadataResolver;

    @Transactional
    public MoneyRequestResponse create(UUID requesterUserId, CreateMoneyRequestRequest request) {
        User requester = requireActiveUser(requesterUserId, "Requester not found");
        Wallet targetWallet = request.targetWalletId() == null
            ? walletService.getActivePersonalWalletForUser(requesterUserId)
            : walletService.getActiveOwnedWalletForUser(requesterUserId, request.targetWalletId());
        User payer = resolveOptionalPayer(request.payerPhoneNumber(), requester.getId());
        BigDecimal amount = normalizeOptionalAmount(request.amount());
        Instant expiresAt = Instant.now().plus(resolveExpiry(request.expiresInMinutes()));

        MoneyRequest moneyRequest = moneyRequestRepository.save(MoneyRequest.builder()
            .requestRef(generateRequestRef())
            .requesterUser(requester)
            .payerUser(payer)
            .targetWallet(targetWallet)
            .status(MoneyRequestStatus.PENDING)
            .amount(amount)
            .currencyCode(targetWallet.getCurrencyCode())
            .reason(normalize(request.reason()))
            .expiresAt(expiresAt)
            .metadata(new LinkedHashMap<>())
            .build());

        QrTokenResponse qr = qrService.generateMoneyRequestQr(moneyRequest);
        return toResponse(moneyRequest, qr);
    }

    @Transactional
    public List<MoneyRequestResponse> listForUser(UUID userId) {
        return moneyRequestRepository.findRecentForUser(userId).stream()
            .map(this::refreshExpiredStatus)
            .map(request -> toResponse(request, null))
            .toList();
    }

    @Transactional
    public MoneyRequestDetailsResponse getDetails(UUID currentUserId, String requestRef) {
        MoneyRequest moneyRequest = refreshExpiredStatus(findByRequestRefOrThrow(requestRef));
        User viewer = requireActiveUser(currentUserId, "User not found");
        ensureViewerAccess(moneyRequest, viewer.getId());

        boolean viewerIsRequester = viewer.getId().equals(moneyRequest.getRequesterUser().getId());
        boolean payableByViewer = !viewerIsRequester
            && moneyRequest.getStatus() == MoneyRequestStatus.PENDING
            && (moneyRequest.getPayerUser() == null || viewer.getId().equals(moneyRequest.getPayerUser().getId()));
        boolean cancelableByViewer = viewerIsRequester && moneyRequest.getStatus() == MoneyRequestStatus.PENDING;
        boolean declinableByViewer = payableByViewer;
        QrTokenResponse qr = viewerIsRequester
            ? qrTokenRepository.findTopByMoneyRequest_IdOrderByCreatedAtDesc(moneyRequest.getId())
                .map(qrService::toResponse)
                .orElse(null)
            : null;

        return toDetailsResponse(
            moneyRequest,
            viewerIsRequester,
            payableByViewer,
            cancelableByViewer,
            declinableByViewer,
            qr
        );
    }

    @Transactional
    public MoneyRequestQuoteResponse quote(UUID payerUserId, String requestRef, MoneyRequestQuoteRequest request) {
        MoneyRequest moneyRequest = findByRequestRefOrThrow(requestRef);
        ensurePayable(moneyRequest, payerUserId);

        User payer = requireActiveUser(payerUserId, "Payer not found");
        Wallet sourceWallet = walletService.getActivePersonalWalletForUser(payerUserId);
        Wallet destinationWallet = moneyRequest.getTargetWallet();
        BigDecimal amount = resolveSettlementAmount(moneyRequest, request == null ? null : request.amount());
        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.MONEY_REQUEST.name(),
            sourceWallet.getCurrencyCode(),
            "CUSTOMER",
            "CUSTOMER",
            null,
            amount
        );
        walletLimitService.assertCanDebit(sourceWallet, feeQuote.totalDebit());
        CurrencyMetadata currency = currencyMetadataResolver.resolve(sourceWallet.getCurrencyCode());

        return new MoneyRequestQuoteResponse(
            moneyRequest.getRequestRef(),
            moneyRequest.getRequesterUser().getDisplayName(),
            sourceWallet.getWalletNumber(),
            destinationWallet == null ? null : destinationWallet.getWalletNumber(),
            amount,
            feeQuote.feeAmount(),
            feeQuote.totalDebit(),
            feeQuote.netAmount(),
            sourceWallet.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            moneyRequest.getReason(),
            moneyRequest.getExpiresAt()
        );
    }

    @Transactional
    public MoneyRequestPaymentResponse accept(UUID payerUserId, String requestRef, AcceptMoneyRequestRequest request) {
        String normalizedIdempotencyKey = request.idempotencyKey().trim();
        Transaction existingTransaction = transactionRepository.findByIdempotencyKey(normalizedIdempotencyKey).orElse(null);
        if (existingTransaction != null) {
            if (existingTransaction.getInitiatorUser() == null
                || !payerUserId.equals(existingTransaction.getInitiatorUser().getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Idempotency key is already in use");
            }
            return toPaymentResponse(existingTransaction);
        }

        MoneyRequest moneyRequest = findByRequestRefOrThrow(requestRef);
        ensurePayable(moneyRequest, payerUserId);

        User payer = requireActiveUser(payerUserId, "Payer not found");
        transactionPinService.validateOrThrow(payerUserId, request.pin());

        if (moneyRequest.getPayerUser() == null) {
            moneyRequest.setPayerUser(payer);
        }

        Wallet sourceWallet = walletService.getActivePersonalWalletForUser(payerUserId);
        Wallet destinationWallet = moneyRequest.getTargetWallet();
        BigDecimal amount = resolveSettlementAmount(moneyRequest, request.amount());
        FeeQuote feeQuote = feeEngineService.quote(
            TransactionType.MONEY_REQUEST.name(),
            sourceWallet.getCurrencyCode(),
            "CUSTOMER",
            "CUSTOMER",
            null,
            amount
        );
        walletLimitService.assertCanDebit(sourceWallet, feeQuote.totalDebit());

        Transaction transaction = walletPaymentExecutionService.execute(new WalletPaymentCommand(
            TransactionType.MONEY_REQUEST,
            TransactionChannel.MOBILE_APP,
            sourceWallet,
            destinationWallet,
            payer,
            payer,
            moneyRequest.getRequesterUser(),
            null,
            qrTokenRepository.findTopByMoneyRequest_IdOrderByCreatedAtDesc(moneyRequest.getId()).orElse(null),
            moneyRequest,
            normalizedIdempotencyKey,
            amount,
            feeQuote,
            normalize(request.description()) == null ? moneyRequest.getReason() : normalize(request.description())
        ));

        Instant now = Instant.now();
        moneyRequest.setAmount(amount);
        moneyRequest.setStatus(MoneyRequestStatus.PAID);
        moneyRequest.setAcceptedAt(now);
        moneyRequest.setPaidAt(now);
        moneyRequestRepository.save(moneyRequest);

        qrTokenRepository.findTopByMoneyRequest_IdOrderByCreatedAtDesc(moneyRequest.getId())
            .ifPresent(qrService::markUsed);

        return toPaymentResponse(transaction);
    }

    @Transactional
    public MoneyRequestResponse decline(UUID payerUserId, String requestRef) {
        MoneyRequest moneyRequest = findByRequestRefOrThrow(requestRef);
        ensurePending(moneyRequest);
        ensurePayerAccess(moneyRequest, payerUserId);

        if (moneyRequest.getPayerUser() == null) {
            moneyRequest.setPayerUser(requireActiveUser(payerUserId, "Payer not found"));
        }

        moneyRequest.setStatus(MoneyRequestStatus.DECLINED);
        moneyRequest.setDeclinedAt(Instant.now());
        return toResponse(moneyRequestRepository.save(moneyRequest), null);
    }

    @Transactional
    public MoneyRequestResponse cancel(UUID requesterUserId, String requestRef) {
        MoneyRequest moneyRequest = findByRequestRefOrThrow(requestRef);

        if (!requesterUserId.equals(moneyRequest.getRequesterUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the requester can cancel this money request");
        }
        ensurePending(moneyRequest);

        moneyRequest.setStatus(MoneyRequestStatus.CANCELLED);
        moneyRequest.setCancelledAt(Instant.now());
        qrTokenRepository.findTopByMoneyRequest_IdOrderByCreatedAtDesc(moneyRequest.getId())
            .ifPresent(qr -> qrService.invalidate(qr, "Money request cancelled"));

        return toResponse(moneyRequestRepository.save(moneyRequest), null);
    }

    private void ensurePayable(MoneyRequest moneyRequest, UUID payerUserId) {
        ensurePending(refreshExpiredStatus(moneyRequest));
        ensurePayerAccess(moneyRequest, payerUserId);
    }

    private void ensurePending(MoneyRequest moneyRequest) {
        if (moneyRequest.getStatus() != MoneyRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Money request is no longer pending");
        }
    }

    private void ensurePayerAccess(MoneyRequest moneyRequest, UUID payerUserId) {
        if (moneyRequest.getRequesterUser().getId().equals(payerUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot settle your own money request");
        }
        if (moneyRequest.getPayerUser() != null && !payerUserId.equals(moneyRequest.getPayerUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This money request is assigned to another user");
        }
    }

    private void ensureViewerAccess(MoneyRequest moneyRequest, UUID viewerUserId) {
        if (moneyRequest.getRequesterUser().getId().equals(viewerUserId)) {
            return;
        }
        if (moneyRequest.getPayerUser() == null) {
            return;
        }
        if (viewerUserId.equals(moneyRequest.getPayerUser().getId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This money request is assigned to another user");
    }

    private User requireActiveUser(UUID userId, String notFoundMessage) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, notFoundMessage));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }
        return user;
    }

    private User resolveOptionalPayer(String phoneNumber, UUID requesterUserId) {
        String normalizedPhone = normalize(phoneNumber);
        if (normalizedPhone == null) {
            return null;
        }
        User payer = userRepository.findByPhoneNumberAndDeletedAtIsNull(normalizedPhone)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target payer not found"));
        if (payer.getId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requester and payer cannot be the same user");
        }
        if (payer.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target payer account is not active");
        }
        return payer;
    }

    private BigDecimal resolveSettlementAmount(MoneyRequest moneyRequest, BigDecimal providedAmount) {
        if (moneyRequest.getAmount() != null) {
            return moneyRequest.getAmount();
        }
        if (providedAmount == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required to settle this money request");
        }
        return normalizeAmount(providedAmount);
    }

    private Duration resolveExpiry(Integer expiresInMinutes) {
        if (expiresInMinutes == null) {
            return DEFAULT_EXPIRY;
        }
        if (expiresInMinutes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry must be positive");
        }
        return Duration.ofMinutes(expiresInMinutes);
    }

    private BigDecimal normalizeOptionalAmount(BigDecimal amount) {
        return amount == null ? null : normalizeAmount(amount);
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be positive");
        }
        return amount.setScale(4, RoundingMode.HALF_UP);
    }

    private MoneyRequestResponse toResponse(MoneyRequest moneyRequest, QrTokenResponse qr) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(moneyRequest.getCurrencyCode());
        Wallet targetWallet = moneyRequest.getTargetWallet();
        return new MoneyRequestResponse(
            moneyRequest.getId(),
            moneyRequest.getRequestRef(),
            moneyRequest.getStatus().name(),
            moneyRequest.getRequesterUser().getDisplayName(),
            moneyRequest.getPayerUser() == null ? null : moneyRequest.getPayerUser().getPhoneNumber(),
            targetWallet == null ? null : targetWallet.getWalletNumber(),
            moneyRequest.getAmount(),
            moneyRequest.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            moneyRequest.getReason(),
            moneyRequest.getExpiresAt(),
            moneyRequest.getPaidAt(),
            qr
        );
    }

    private MoneyRequestDetailsResponse toDetailsResponse(
        MoneyRequest moneyRequest,
        boolean viewerIsRequester,
        boolean payableByViewer,
        boolean cancelableByViewer,
        boolean declinableByViewer,
        QrTokenResponse qr
    ) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(moneyRequest.getCurrencyCode());
        Wallet targetWallet = moneyRequest.getTargetWallet();
        User payer = moneyRequest.getPayerUser();

        return new MoneyRequestDetailsResponse(
            moneyRequest.getId(),
            moneyRequest.getRequestRef(),
            moneyRequest.getStatus().name(),
            moneyRequest.getRequesterUser().getDisplayName(),
            moneyRequest.getRequesterUser().getPhoneNumber(),
            payer == null ? null : payer.getDisplayName(),
            payer == null ? null : payer.getPhoneNumber(),
            targetWallet == null ? null : targetWallet.getWalletNumber(),
            moneyRequest.getAmount(),
            moneyRequest.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            moneyRequest.getReason(),
            moneyRequest.getCreatedAt(),
            moneyRequest.getExpiresAt(),
            moneyRequest.getPaidAt(),
            viewerIsRequester,
            payableByViewer,
            cancelableByViewer,
            declinableByViewer,
            qr
        );
    }

    private MoneyRequestPaymentResponse toPaymentResponse(Transaction transaction) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(transaction.getCurrencyCode());
        BigDecimal totalDebit = transaction.getAmount().add(
            transaction.getFeeBearer() == TransactionFeeBearer.PAYER
                ? transaction.getFeeAmount()
                : BigDecimal.ZERO
        );
        return new MoneyRequestPaymentResponse(
            transaction.getMoneyRequest() == null ? null : transaction.getMoneyRequest().getRequestRef(),
            transaction.getStatus().name(),
            transaction.getId(),
            transaction.getTransactionRef(),
            transaction.getAmount(),
            transaction.getFeeAmount(),
            totalDebit,
            transaction.getNetAmount(),
            transaction.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            transaction.getCompletedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private MoneyRequest findByRequestRefOrThrow(String requestRef) {
        return moneyRequestRepository.findByRequestRef(requestRef)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Money request not found"));
    }

    private MoneyRequest refreshExpiredStatus(MoneyRequest moneyRequest) {
        if (moneyRequest.getStatus() == MoneyRequestStatus.PENDING
            && moneyRequest.getExpiresAt() != null
            && moneyRequest.getExpiresAt().isBefore(Instant.now())) {
            moneyRequest.setStatus(MoneyRequestStatus.EXPIRED);
            return moneyRequestRepository.save(moneyRequest);
        }

        return moneyRequest;
    }

    private String generateRequestRef() {
        return "MRQ-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase(Locale.ROOT);
    }
}
