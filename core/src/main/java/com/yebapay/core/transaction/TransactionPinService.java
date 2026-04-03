package com.yebapay.core.transaction;

import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TransactionPinService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionSecurityProperties securityProperties;

    @Transactional
    public User validateOrThrow(UUID userId, String rawPin) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getPinHash() == null || user.getPinHash().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction PIN is not configured");
        }
        if (rawPin == null || rawPin.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction PIN is required");
        }
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.LOCKED, "Transaction PIN is temporarily locked");
        }

        if (!passwordEncoder.matches(rawPin.trim(), user.getPinHash())) {
            int failedAttempts = (user.getFailedPinAttempts() == null ? 0 : user.getFailedPinAttempts()) + 1;
            user.setFailedPinAttempts(failedAttempts);
            if (failedAttempts >= securityProperties.getPinMaxAttempts()) {
                user.setLockedUntil(Instant.now().plus(securityProperties.getPinLockDuration()));
                user.setFailedPinAttempts(0);
            }
            userRepository.save(user);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid transaction PIN");
        }

        user.setFailedPinAttempts(0);
        user.setLockedUntil(null);
        return userRepository.save(user);
    }

    @Transactional
    public User setupInitialPin(UUID userId, String rawPin) {
        User user = userRepository.findByIdAndDeletedAtIsNull(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getPinHash() != null && !user.getPinHash().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Transaction PIN is already configured");
        }

        user.setPinHash(passwordEncoder.encode(rawPin.trim()));
        user.setFailedPinAttempts(0);
        user.setLockedUntil(null);
        return userRepository.save(user);
    }
}
