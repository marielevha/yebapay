package com.yebapay.core.identity.auth;

public record IssuedRefreshToken(
    String rawToken,
    long expiresInSeconds,
    RefreshToken entity
) {
}
