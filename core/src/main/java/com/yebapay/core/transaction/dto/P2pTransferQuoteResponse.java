package com.yebapay.core.transaction.dto;

import java.math.BigDecimal;

public record P2pTransferQuoteResponse(
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
    String description
) {
}
