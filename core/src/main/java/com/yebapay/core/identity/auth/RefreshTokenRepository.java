package com.yebapay.core.identity.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select refreshToken from RefreshToken refreshToken where refreshToken.tokenHash = :tokenHash")
    Optional<RefreshToken> findLockedByTokenHash(@Param("tokenHash") String tokenHash);

    List<RefreshToken> findByTokenFamilyIdAndStatus(UUID tokenFamilyId, RefreshTokenStatus status);

    List<RefreshToken> findByUser_IdAndStatus(UUID userId, RefreshTokenStatus status);
}
