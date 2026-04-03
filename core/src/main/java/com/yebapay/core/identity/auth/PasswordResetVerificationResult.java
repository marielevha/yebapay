package com.yebapay.core.identity.auth;

public record PasswordResetVerificationResult(
    String resetToken,
    long expiresInSeconds
) {
}
