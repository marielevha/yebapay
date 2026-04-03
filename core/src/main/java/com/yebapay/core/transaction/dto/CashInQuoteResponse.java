package com.yebapay.core.transaction.dto;

import java.math.BigDecimal;

public record CashInQuoteResponse(
    String beneficiaryDisplayName,
    String beneficiaryWalletNumber,
    BigDecimal amount,
    BigDecimal feeAmount,
    BigDecimal creditedAmount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName
) {
}
