package com.yebapay.core.qr.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record QrTokenResponse(
    UUID id,
    String qrRef,
    String qrType,
    String status,
    String signedPayload,
    String walletNumber,
    BigDecimal amount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    boolean singleUse,
    Instant expiresAt
) {
}
