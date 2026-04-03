package com.yebapay.core.identity.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(
    @NotBlank
    @Size(max = 30)
    String phoneNumber
) {
}
