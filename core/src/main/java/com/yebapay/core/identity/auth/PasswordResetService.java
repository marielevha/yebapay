package com.yebapay.core.identity.auth;

import com.yebapay.core.identity.User;
import com.yebapay.core.identity.UserRepository;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.identity.auth.dto.AuthActionResponse;
import com.yebapay.core.identity.auth.dto.ForgotPasswordRequest;
import com.yebapay.core.identity.auth.dto.ResetPasswordRequest;
import com.yebapay.core.identity.auth.dto.VerifyPasswordResetOtpRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final OtpChallengeRepository otpChallengeRepository;
    private final PasswordResetSessionRepository passwordResetSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final OpaqueTokenService opaqueTokenService;
    private final DevelopmentSmsSender developmentSmsSender;
    private final RefreshTokenService refreshTokenService;
    private final AuthProperties authProperties;

    @Transactional
    public AuthActionResponse requestPasswordReset(ForgotPasswordRequest request) {
        String normalizedPhoneNumber = normalizePhoneNumber(request.phoneNumber());
        Optional<User> optionalUser = userRepository.findByPhoneNumberAndDeletedAtIsNull(normalizedPhoneNumber);

        if (optionalUser.isEmpty()) {
            return genericForgotPasswordResponse();
        }

        User user = optionalUser.get();
        Instant now = Instant.now();

        Optional<OtpChallenge> latestPendingChallenge = otpChallengeRepository
            .findTopByUser_IdAndPurposeAndStatusOrderByCreatedAtDesc(user.getId(), AuthOtpPurpose.PASSWORD_RESET, AuthOtpStatus.PENDING);

        if (latestPendingChallenge.isPresent()
            && latestPendingChallenge.get().getExpiresAt().isAfter(now)
            && latestPendingChallenge.get().getLastSentAt().isAfter(now.minus(authProperties.getOtpResendCooldown()))) {
            return genericForgotPasswordResponse();
        }

        cancelPendingChallenges(user.getId(), now);

        String otpCode = opaqueTokenService.generateNumericCode(authProperties.getOtpLength());
        OtpChallenge otpChallenge = otpChallengeRepository.save(OtpChallenge.builder()
            .user(user)
            .purpose(AuthOtpPurpose.PASSWORD_RESET)
            .channel(AuthChannel.SMS)
            .deliveryTarget(normalizedPhoneNumber)
            .codeHash(passwordEncoder.encode(otpCode))
            .status(AuthOtpStatus.PENDING)
            .expiresAt(now.plus(authProperties.getPasswordResetOtpTtl()))
            .lastSentAt(now)
            .sendCount(1)
            .failedAttempts(0)
            .maxAttempts(authProperties.getOtpMaxAttempts())
            .metadata(new LinkedHashMap<>())
            .build());

        developmentSmsSender.sendPasswordResetOtp(user, otpChallenge, otpCode);
        return genericForgotPasswordResponse();
    }

    @Transactional
    public PasswordResetVerificationResult verifyPasswordResetOtp(VerifyPasswordResetOtpRequest request) {
        String normalizedPhoneNumber = normalizePhoneNumber(request.phoneNumber());
        User user = userRepository.findByPhoneNumberAndDeletedAtIsNull(normalizedPhoneNumber)
            .orElseThrow(() -> invalidOtpException());

        OtpChallenge otpChallenge = otpChallengeRepository
            .findTopByUser_IdAndPurposeAndStatusOrderByCreatedAtDesc(user.getId(), AuthOtpPurpose.PASSWORD_RESET, AuthOtpStatus.PENDING)
            .orElseThrow(this::invalidOtpException);

        Instant now = Instant.now();
        if (otpChallenge.getExpiresAt().isBefore(now)) {
            otpChallenge.setStatus(AuthOtpStatus.EXPIRED);
            otpChallengeRepository.save(otpChallenge);
            throw invalidOtpException();
        }

        if (!passwordEncoder.matches(request.otpCode().trim(), otpChallenge.getCodeHash())) {
            int failedAttempts = otpChallenge.getFailedAttempts() + 1;
            otpChallenge.setFailedAttempts(failedAttempts);
            if (failedAttempts >= otpChallenge.getMaxAttempts()) {
                otpChallenge.setStatus(AuthOtpStatus.FAILED);
            }
            otpChallengeRepository.save(otpChallenge);
            throw invalidOtpException();
        }

        otpChallenge.setStatus(AuthOtpStatus.VERIFIED);
        otpChallenge.setVerifiedAt(now);
        otpChallengeRepository.save(otpChallenge);

        revokeActivePasswordResetSessions(user.getId(), now, "Superseded by a new verification");

        String rawResetToken = opaqueTokenService.generateToken();
        passwordResetSessionRepository.save(PasswordResetSession.builder()
            .user(user)
            .otpChallenge(otpChallenge)
            .tokenHash(opaqueTokenService.hash(rawResetToken))
            .status(PasswordResetSessionStatus.ACTIVE)
            .expiresAt(now.plus(authProperties.getPasswordResetSessionTtl()))
            .metadata(new LinkedHashMap<>())
            .build());

        return new PasswordResetVerificationResult(rawResetToken, authProperties.getPasswordResetSessionTtl().toSeconds());
    }

    @Transactional
    public AuthActionResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetSession session = passwordResetSessionRepository.findLockedByTokenHash(opaqueTokenService.hash(request.resetToken()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset token is invalid"));

        Instant now = Instant.now();
        if (session.getStatus() != PasswordResetSessionStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset token is no longer valid");
        }

        if (session.getExpiresAt().isBefore(now)) {
            session.setStatus(PasswordResetSessionStatus.EXPIRED);
            passwordResetSessionRepository.save(session);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset token has expired");
        }

        User user = session.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setFailedPasswordAttempts(0);
        user.setLockedUntil(null);
        if (user.getStatus() == UserStatus.LOCKED) {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);

        session.setStatus(PasswordResetSessionStatus.CONSUMED);
        session.setConsumedAt(now);
        passwordResetSessionRepository.save(session);

        refreshTokenService.revokeAllForUser(user.getId(), "Password reset completed");
        revokeActivePasswordResetSessions(user.getId(), now, "Password reset completed");

        return new AuthActionResponse("Password reset completed successfully.");
    }

    private void cancelPendingChallenges(java.util.UUID userId, Instant now) {
        List<OtpChallenge> pendingChallenges = otpChallengeRepository
            .findByUser_IdAndPurposeAndStatus(userId, AuthOtpPurpose.PASSWORD_RESET, AuthOtpStatus.PENDING);

        for (OtpChallenge pendingChallenge : pendingChallenges) {
            pendingChallenge.setStatus(AuthOtpStatus.CANCELLED);
            pendingChallenge.setCancelledAt(now);
        }

        otpChallengeRepository.saveAll(pendingChallenges);
    }

    private void revokeActivePasswordResetSessions(java.util.UUID userId, Instant now, String reason) {
        List<PasswordResetSession> activeSessions = passwordResetSessionRepository
            .findByUser_IdAndStatus(userId, PasswordResetSessionStatus.ACTIVE);

        for (PasswordResetSession activeSession : activeSessions) {
            activeSession.setStatus(PasswordResetSessionStatus.REVOKED);
            activeSession.setRevokedAt(now);
            activeSession.setRevokeReason(reason);
        }

        passwordResetSessionRepository.saveAll(activeSessions);
    }

    private AuthActionResponse genericForgotPasswordResponse() {
        return new AuthActionResponse("If an account exists for this phone number, an OTP has been sent.");
    }

    private ResponseStatusException invalidOtpException() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP code is invalid or expired");
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null ? null : phoneNumber.trim();
    }
}
