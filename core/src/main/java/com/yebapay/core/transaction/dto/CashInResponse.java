package com.yebapay.core.transaction.dto;

import com.yebapay.core.transaction.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CashInResponse(
    UUID transactionId,
    String transactionRef,
    TransactionStatus status,
    String beneficiaryDisplayName,
    String beneficiaryWalletNumber,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal creditedAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    Instant completedAt
) {
}
