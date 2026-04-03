package com.yebapay.core.transaction.dto;

import com.yebapay.core.qr.dto.QrTokenResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MoneyRequestResponse(
    UUID id,
    String requestRef,
    String status,
    String requesterDisplayName,
    String payerPhoneNumber,
    String targetWalletNumber,
    BigDecimal amount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    String reason,
    Instant expiresAt,
    Instant paidAt,
    QrTokenResponse qr
) {
}
