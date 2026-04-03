package com.yebapay.core.transaction.dto;

import java.math.BigDecimal;

public record MerchantPaymentQuoteResponse(
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
    String description
) {
}
