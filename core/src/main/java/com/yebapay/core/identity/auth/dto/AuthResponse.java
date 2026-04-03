package com.yebapay.core.identity.auth.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresInSeconds,
    long refreshTokenExpiresInSeconds,
    CurrentUserResponse user
) {
}
