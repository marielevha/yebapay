package com.yebapay.core.identity.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, UUID> {

    Optional<OtpChallenge> findTopByUser_IdAndPurposeAndStatusOrderByCreatedAtDesc(
        UUID userId,
        AuthOtpPurpose purpose,
        AuthOtpStatus status
    );

    List<OtpChallenge> findByUser_IdAndPurposeAndStatus(UUID userId, AuthOtpPurpose purpose, AuthOtpStatus status);
}
