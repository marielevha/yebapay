package com.yebapay.core.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MoneyRequestQuoteResponse(
    String requestRef,
    String requesterDisplayName,
    String sourceWalletNumber,
    String targetWalletNumber,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal totalDebit,
    BigDecimal netAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    String reason,
    Instant expiresAt
) {
}
