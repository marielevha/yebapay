package com.yebapay.core.identity.auth;

import jakarta.servlet.http.HttpServletRequest;

public record ClientRequestDetails(
    String ipAddress,
    String userAgent
) {

    public static ClientRequestDetails from(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String ipAddress = forwardedFor == null || forwardedFor.isBlank()
            ? request.getRemoteAddr()
            : forwardedFor.split(",")[0].trim();

        String userAgent = request.getHeader("User-Agent");
        return new ClientRequestDetails(ipAddress, userAgent);
    }
}
