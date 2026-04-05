package com.yebapay.core.common.http;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(1)
public class RequestTracingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestTracingFilter.class);

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        long startedAtNanos = System.nanoTime();
        Exception failure = null;

        try {
            filterChain.doFilter(request, response);
        } catch (Exception exception) {
            failure = exception;
            throw exception;
        } finally {
            long durationMs = (System.nanoTime() - startedAtNanos) / 1_000_000;
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String query = request.getQueryString();
            String clientIp = extractClientIp(request);
            int status = response.getStatus();
            String fullPath = query == null || query.isBlank() ? uri : uri + "?" + query;

            if (failure == null) {
                log.info("HTTP {} {} -> {} ({} ms) ip={}", method, fullPath, status, durationMs, clientIp);
            } else {
                log.warn(
                    "HTTP {} {} -> {} ({} ms) ip={} failed={}",
                    method,
                    fullPath,
                    status,
                    durationMs,
                    clientIp,
                    failure.getClass().getSimpleName()
                );
            }
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
