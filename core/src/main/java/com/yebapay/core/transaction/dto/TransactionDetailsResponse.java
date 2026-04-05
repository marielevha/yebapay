package com.yebapay.core.transaction.dto;

import com.yebapay.core.transaction.TransactionStatus;
import com.yebapay.core.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionDetailsResponse(
    UUID id,
    String transactionRef,
    TransactionType transactionType,
    TransactionStatus status,
    String direction,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal totalDebit,
    BigDecimal netAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    String sourceWalletNumber,
    String destinationWalletNumber,
    String counterpartyDisplayName,
    String counterpartyPhoneNumber,
    String payerDisplayName,
    String payerPhoneNumber,
    String payeeDisplayName,
    String payeePhoneNumber,
    String description,
    String failureCode,
    String failureMessage,
    Instant initiatedAt,
    Instant completedAt
) {
}
