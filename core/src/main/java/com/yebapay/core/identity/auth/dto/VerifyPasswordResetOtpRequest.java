package com.yebapay.core.identity.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyPasswordResetOtpRequest(
    @NotBlank
    @Size(max = 30)
    String phoneNumber,

    @NotBlank
    @Pattern(regexp = "^\\d{4,8}$", message = "OTP must contain 4 to 8 digits")
    String otpCode
) {
}
