package com.yebapay.core.fee;

import com.yebapay.core.transaction.TransactionFeeBearer;
import java.math.BigDecimal;

public record FeeQuote(
    FeeRuleVersion feeRuleVersion,
    String feeCode,
    String feeLabel,
    String feeType,
    String calculationMode,
    String supportedBy,
    TransactionFeeBearer feeBearer,
    BigDecimal feeAmount,
    BigDecimal totalDebit,
    BigDecimal netAmount
) {

    public static FeeQuote zero(BigDecimal amount) {
        return new FeeQuote(
            null,
            "NO_FEE",
            "No fee",
            "SERVICE_FEE",
            "FIXED",
            TransactionFeeBearer.PLATFORM.name(),
            TransactionFeeBearer.PLATFORM,
            BigDecimal.ZERO,
            amount,
            amount
        );
    }
}
