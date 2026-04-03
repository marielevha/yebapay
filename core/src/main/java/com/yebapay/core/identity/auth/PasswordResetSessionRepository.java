package com.yebapay.core.identity.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetSessionRepository extends JpaRepository<PasswordResetSession, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select session from PasswordResetSession session where session.tokenHash = :tokenHash")
    Optional<PasswordResetSession> findLockedByTokenHash(@Param("tokenHash") String tokenHash);

    List<PasswordResetSession> findByUser_IdAndStatus(UUID userId, PasswordResetSessionStatus status);
}
