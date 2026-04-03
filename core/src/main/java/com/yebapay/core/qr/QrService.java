package com.yebapay.core.qr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yebapay.core.common.currency.CurrencyMetadata;
import com.yebapay.core.common.currency.CurrencyMetadataResolver;
import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.merchant.MerchantProfile;
import com.yebapay.core.merchant.MerchantProfileRepository;
import com.yebapay.core.qr.dto.DecodedQrResponse;
import com.yebapay.core.qr.dto.QrTokenResponse;
import com.yebapay.core.transaction.MoneyRequest;
import com.yebapay.core.wallet.Wallet;
import com.yebapay.core.wallet.WalletService;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class QrService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final QrTokenRepository qrTokenRepository;
    private final UserRepository userRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final WalletService walletService;
    private final CurrencyMetadataResolver currencyMetadataResolver;
    private final QrProperties qrProperties;
    private final ObjectMapper objectMapper;

    @Transactional
    public QrTokenResponse generatePersonalQr(UUID userId) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Wallet wallet = walletService.getActivePersonalWalletForUser(userId);
        return toResponse(saveQrToken(buildQrToken(
            QrType.PERSONAL,
            "USER",
            user,
            user,
            wallet,
            null,
            null,
            wallet.getCurrencyCode(),
            false,
            Instant.now().plus(qrProperties.getPersonalQrTtl())
        )));
    }

    @Transactional
    public QrTokenResponse generateMerchantStaticQr(MerchantProfile merchantProfile, Wallet merchantWallet) {
        return toResponse(saveQrToken(buildQrToken(
            QrType.MERCHANT_STATIC,
            "MERCHANT",
            merchantProfile.getUser(),
            merchantProfile.getUser(),
            merchantWallet,
            null,
            null,
            merchantWallet.getCurrencyCode(),
            false,
            Instant.now().plus(qrProperties.getMerchantStaticQrTtl())
        )));
    }

    @Transactional
    public QrTokenResponse generateMoneyRequestQr(MoneyRequest moneyRequest) {
        Instant expiresAt = moneyRequest.getExpiresAt() != null
            ? moneyRequest.getExpiresAt()
            : Instant.now().plus(qrProperties.getMoneyRequestQrTtl());

        return toResponse(saveQrToken(buildQrToken(
            QrType.MONEY_REQUEST,
            "USER",
            moneyRequest.getRequesterUser(),
            moneyRequest.getRequesterUser(),
            moneyRequest.getTargetWallet(),
            moneyRequest,
            moneyRequest.getAmount(),
            moneyRequest.getCurrencyCode(),
            true,
            expiresAt
        )));
    }

    @Transactional(readOnly = true)
    public DecodedQrResponse decode(String qrData) {
        QrToken qrToken = resolveByPayloadOrReference(qrData);
        validateTemporalState(qrToken);

        CurrencyMetadata currency = currencyMetadataResolver.resolve(qrToken.getCurrencyCode());
        MerchantProfile merchantProfile = qrToken.getQrType() == QrType.MERCHANT_STATIC && qrToken.getBeneficiaryUser() != null
            ? merchantProfileRepository.findByUser_IdAndDeletedAtIsNull(qrToken.getBeneficiaryUser().getId()).orElse(null)
            : null;

        return new DecodedQrResponse(
            qrToken.getQrRef(),
            qrToken.getQrType().name(),
            qrToken.getStatus().name(),
            qrToken.getSignedPayload(),
            qrToken.getTargetWallet() == null ? null : qrToken.getTargetWallet().getWalletNumber(),
            merchantProfile == null ? null : merchantProfile.getMerchantCode(),
            merchantProfile == null ? null : merchantDisplayName(merchantProfile),
            qrToken.getBeneficiaryUser() == null ? null : qrToken.getBeneficiaryUser().getDisplayName(),
            qrToken.getMoneyRequest() == null ? null : qrToken.getMoneyRequest().getRequestRef(),
            qrToken.getAmount(),
            qrToken.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            qrToken.isSingleUse(),
            qrToken.getExpiresAt()
        );
    }

    @Transactional
    public QrToken requireUsableQr(String qrData, QrType expectedType) {
        QrToken qrToken = resolveByPayloadOrReference(qrData);
        validateTemporalState(qrToken);

        if (expectedType != null && qrToken.getQrType() != expectedType) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR type is not compatible with this operation");
        }
        if (qrToken.getStatus() != QrStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR is not active");
        }
        if (qrToken.isSingleUse() && qrToken.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR has already been used");
        }
        return qrToken;
    }

    @Transactional
    public void markUsed(QrToken qrToken) {
        Instant now = Instant.now();
        qrToken.setUsageCount((qrToken.getUsageCount() == null ? 0 : qrToken.getUsageCount()) + 1);
        if (qrToken.getFirstScannedAt() == null) {
            qrToken.setFirstScannedAt(now);
        }
        qrToken.setLastScannedAt(now);

        if (qrToken.isSingleUse()) {
            qrToken.setUsedAt(now);
            qrToken.setStatus(QrStatus.USED);
        }

        qrTokenRepository.save(qrToken);
    }

    @Transactional
    public void invalidate(QrToken qrToken, String reason) {
        qrToken.setStatus(QrStatus.INVALIDATED);
        qrToken.setInvalidatedAt(Instant.now());
        qrToken.setInvalidationReason(reason);
        qrTokenRepository.save(qrToken);
    }

    public QrTokenResponse toResponse(QrToken qrToken) {
        CurrencyMetadata currency = currencyMetadataResolver.resolve(qrToken.getCurrencyCode());
        return new QrTokenResponse(
            qrToken.getId(),
            qrToken.getQrRef(),
            qrToken.getQrType().name(),
            qrToken.getStatus().name(),
            qrToken.getSignedPayload(),
            qrToken.getTargetWallet() == null ? null : qrToken.getTargetWallet().getWalletNumber(),
            qrToken.getAmount(),
            qrToken.getCurrencyCode(),
            currency.displayCode(),
            currency.displayName(),
            qrToken.isSingleUse(),
            qrToken.getExpiresAt()
        );
    }

    private QrToken buildQrToken(
        QrType qrType,
        String issuerType,
        User issuerUser,
        User beneficiaryUser,
        Wallet targetWallet,
        MoneyRequest moneyRequest,
        BigDecimal amount,
        String currencyCode,
        boolean singleUse,
        Instant expiresAt
    ) {
        String qrRef = generateQrRef();
        String nonce = UUID.randomUUID().toString().replace("-", "");
        Instant issuedAt = Instant.now();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("qrRef", qrRef);
        payload.put("qrType", qrType.name());
        payload.put("issuerType", issuerType);
        payload.put("issuerUserId", issuerUser == null ? null : issuerUser.getId());
        payload.put("beneficiaryUserId", beneficiaryUser == null ? null : beneficiaryUser.getId());
        payload.put("targetWalletId", targetWallet == null ? null : targetWallet.getId());
        payload.put("moneyRequestId", moneyRequest == null ? null : moneyRequest.getId());
        payload.put("amount", amount);
        payload.put("currencyCode", currencyCode);
        payload.put("expiresAt", expiresAt);
        payload.put("nonce", nonce);

        String encodedPayload = encodePayload(payload);
        String signature = sign(encodedPayload);

        return QrToken.builder()
            .qrRef(qrRef)
            .qrType(qrType)
            .issuerType(issuerType)
            .issuerUser(issuerUser)
            .beneficiaryUser(beneficiaryUser)
            .targetWallet(targetWallet)
            .moneyRequest(moneyRequest)
            .payload(payload)
            .signedPayload(encodedPayload + "." + signature)
            .amount(amount)
            .currencyCode(currencyCode)
            .nonce(nonce)
            .signature(signature)
            .singleUse(singleUse)
            .scanLimit(singleUse ? 1 : 1000000)
            .usageCount(0)
            .status(QrStatus.ACTIVE)
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .metadata(new LinkedHashMap<>())
            .build();
    }

    private QrToken saveQrToken(QrToken qrToken) {
        return qrTokenRepository.save(qrToken);
    }

    private QrToken resolveByPayloadOrReference(String qrData) {
        String normalized = qrData == null ? null : qrData.trim();
        if (normalized == null || normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR data is required");
        }

        if (!normalized.contains(".")) {
            return qrTokenRepository.findByQrRef(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR not found"));
        }

        String[] parts = normalized.split("\\.", 2);
        if (parts.length != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR payload is malformed");
        }
        if (!sign(parts[0]).equals(parts[1])) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR signature is invalid");
        }

        Map<String, Object> payload = decodePayload(parts[0]);
        Object qrRef = payload.get("qrRef");
        if (!(qrRef instanceof String qrReference) || qrReference.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR reference is missing");
        }

        QrToken qrToken = qrTokenRepository.findByQrRef(qrReference)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR not found"));
        if (!normalized.equals(qrToken.getSignedPayload())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR payload does not match stored token");
        }
        return qrToken;
    }

    private void validateTemporalState(QrToken qrToken) {
        if (qrToken.getExpiresAt() != null && qrToken.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR has expired");
        }
    }

    private String encodePayload(Map<String, Object> payload) {
        try {
            return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(objectMapper.writeValueAsBytes(payload));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to encode QR payload");
        }
    }

    private Map<String, Object> decodePayload(String encodedPayload) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(encodedPayload);
            return objectMapper.readValue(decoded, MAP_TYPE);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to decode QR payload");
        }
    }

    private String sign(String encodedPayload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(qrProperties.getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(encodedPayload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to sign QR payload");
        }
    }

    private String merchantDisplayName(MerchantProfile merchantProfile) {
        if (merchantProfile.getDisplayName() != null && !merchantProfile.getDisplayName().isBlank()) {
            return merchantProfile.getDisplayName();
        }
        return merchantProfile.getBusinessName();
    }

    private String generateQrRef() {
        return "QR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 14).toUpperCase();
    }
}
