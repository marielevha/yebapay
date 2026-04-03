package com.yebapay.core.fee;

import com.yebapay.core.transaction.TransactionFeeBearer;
import java.math.BigDecimal;

public record FeeComputation(
    FeeRuleVersion feeRuleVersion,
    String feeCode,
    String feeLabel,
    String calculationMode,
    TransactionFeeBearer feeBearer,
    BigDecimal feeAmount
) {

    public static FeeComputation zero(TransactionFeeBearer feeBearer) {
        return new FeeComputation(
            null,
            "NO_FEE",
            "No fee",
            "FIXED",
            feeBearer,
            BigDecimal.ZERO
        );
    }
}
