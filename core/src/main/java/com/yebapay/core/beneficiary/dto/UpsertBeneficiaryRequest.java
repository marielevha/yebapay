package com.yebapay.core.beneficiary.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertBeneficiaryRequest(
    @NotBlank
    @Size(max = 150)
    String displayName,

    @NotBlank
    @Size(max = 50)
    String walletNumber
) {
}
