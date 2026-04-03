package com.yebapay.core.transaction.dto;

import com.yebapay.core.transaction.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MerchantPaymentResponse(
    UUID transactionId,
    String transactionRef,
    TransactionStatus status,
    String merchantCode,
    String merchantDisplayName,
    String payerWalletNumber,
    String merchantWalletNumber,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal totalDebit,
    BigDecimal netAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    String description,
    Instant completedAt
) {
}
