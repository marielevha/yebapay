package com.yebapay.core.identity.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank
    @Size(max = 30)
    String phoneNumber,

    @NotBlank
    @Size(min = 8, max = 72)
    String password,

    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must contain 4 to 6 digits")
    String pin,

    @Email
    @Size(max = 255)
    String email,

    @Size(max = 100)
    String firstName,

    @Size(max = 100)
    String lastName
) {
}
