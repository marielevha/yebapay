package com.yebapay.core.identity.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SetupTransactionPinRequest(
    @NotBlank
    @Pattern(regexp = "^\\d{4,6}$", message = "PIN must contain 4 to 6 digits")
    String pin
) {
}
