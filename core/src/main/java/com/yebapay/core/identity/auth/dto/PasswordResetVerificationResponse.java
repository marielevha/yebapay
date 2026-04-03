package com.yebapay.core.identity.auth.dto;

public record PasswordResetVerificationResponse(
    String resetToken,
    long expiresInSeconds,
    String message
) {
}
