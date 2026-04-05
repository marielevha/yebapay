package com.yebapay.core.transaction.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateMoneyRequestRequest(
    @Size(max = 30)
    String payerPhoneNumber,

    UUID targetWalletId,

    @DecimalMin(value = "0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @Size(max = 255)
    String reason,

    Integer expiresInMinutes
) {
}
