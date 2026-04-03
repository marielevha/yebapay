package com.yebapay.core.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MoneyRequestPaymentResponse(
    String requestRef,
    String status,
    UUID transactionId,
    String transactionRef,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal totalDebit,
    BigDecimal netAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    Instant paidAt
) {
}
