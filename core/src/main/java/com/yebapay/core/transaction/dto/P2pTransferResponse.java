package com.yebapay.core.transaction.dto;

import com.yebapay.core.transaction.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record P2pTransferResponse(
    UUID transactionId,
    String transactionRef,
    TransactionStatus status,
    String sourceWalletNumber,
    String destinationWalletNumber,
    String payerDisplayName,
    String payeeDisplayName,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal totalDebit,
    BigDecimal netAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    String description,
    Instant initiatedAt,
    Instant completedAt
) {
}
