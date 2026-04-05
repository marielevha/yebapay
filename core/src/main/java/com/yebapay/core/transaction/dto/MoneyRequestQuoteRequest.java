package com.yebapay.core.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;

public record MoneyRequestQuoteRequest(
    @DecimalMin(value = "0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount
) {
}
