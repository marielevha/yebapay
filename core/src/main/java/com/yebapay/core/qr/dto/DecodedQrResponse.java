package com.yebapay.core.qr.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record DecodedQrResponse(
    String qrRef,
    String qrType,
    String status,
    String signedPayload,
    String walletNumber,
    String merchantCode,
    String merchantDisplayName,
    String beneficiaryDisplayName,
    String moneyRequestRef,
    BigDecimal amount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    boolean singleUse,
    Instant expiresAt
) {
}
