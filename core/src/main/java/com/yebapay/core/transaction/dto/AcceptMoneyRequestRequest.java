package com.yebapay.core.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record AcceptMoneyRequestRequest(
    @DecimalMin(value = "0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    UUID sourceWalletId,

    @NotBlank
    @Size(max = 100)
    String idempotencyKey,

    @NotBlank
    @Size(min = 4, max = 10)
    String pin,

    @Size(max = 255)
    String description
) {
}
