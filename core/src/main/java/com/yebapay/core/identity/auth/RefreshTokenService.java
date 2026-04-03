package com.yebapay.core.identity.auth;

import com.yebapay.core.identity.User;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final OpaqueTokenService opaqueTokenService;
    private final AuthProperties authProperties;

    @Transactional
    public IssuedRefreshToken issueForNewSession(User user, ClientRequestDetails requestDetails) {
        return createToken(user, UUID.randomUUID(), null, requestDetails);
    }

    @Transactional
    public IssuedRefreshToken rotate(String rawRefreshToken, ClientRequestDetails requestDetails) {
        RefreshToken currentToken = getRefreshTokenForUse(rawRefreshToken);
        Instant now = Instant.now();

        currentToken.setStatus(RefreshTokenStatus.USED);
        currentToken.setUsedAt(now);
        currentToken.setLastUsedAt(now);

        IssuedRefreshToken issuedRefreshToken = createToken(
            currentToken.getUser(),
            currentToken.getTokenFamilyId(),
            currentToken,
            requestDetails
        );

        currentToken.setReplacedByToken(issuedRefreshToken.entity());
        refreshTokenRepository.save(currentToken);
        return issuedRefreshToken;
    }

    @Transactional
    public void revokeFamilyByRawToken(String rawRefreshToken, String reason) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findLockedByTokenHash(opaqueTokenService.hash(rawRefreshToken))
            .ifPresent(refreshToken -> revokeFamily(refreshToken.getTokenFamilyId(), reason));
    }

    @Transactional
    public void revokeAllForUser(UUID userId, String reason) {
        Instant now = Instant.now();
        List<RefreshToken> activeTokens = refreshTokenRepository.findByUser_IdAndStatus(userId, RefreshTokenStatus.ACTIVE);
        for (RefreshToken activeToken : activeTokens) {
            activeToken.setStatus(RefreshTokenStatus.REVOKED);
            activeToken.setRevokedAt(now);
            activeToken.setRevokeReason(reason);
        }
        refreshTokenRepository.saveAll(activeTokens);
    }

    private IssuedRefreshToken createToken(
        User user,
        UUID tokenFamilyId,
        RefreshToken parentToken,
        ClientRequestDetails requestDetails
    ) {
        Instant now = Instant.now();
        String rawToken = opaqueTokenService.generateToken();

        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .tokenFamilyId(tokenFamilyId)
            .tokenHash(opaqueTokenService.hash(rawToken))
            .status(RefreshTokenStatus.ACTIVE)
            .expiresAt(now.plus(authProperties.getRefreshTokenTtl()))
            .parentToken(parentToken)
            .issuedIp(requestDetails.ipAddress())
            .issuedUserAgent(requestDetails.userAgent())
            .metadata(new LinkedHashMap<>())
            .build();

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        return new IssuedRefreshToken(rawToken, authProperties.getRefreshTokenTtl().toSeconds(), savedToken);
    }

    private RefreshToken getRefreshTokenForUse(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is required");
        }

        RefreshToken refreshToken = refreshTokenRepository.findLockedByTokenHash(opaqueTokenService.hash(rawRefreshToken))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid"));

        if (refreshToken.getStatus() != RefreshTokenStatus.ACTIVE) {
            revokeFamily(refreshToken.getTokenFamilyId(), "Refresh token reuse detected");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is no longer valid");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            refreshToken.setStatus(RefreshTokenStatus.EXPIRED);
            refreshTokenRepository.save(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired");
        }

        return refreshToken;
    }

    private void revokeFamily(UUID tokenFamilyId, String reason) {
        Instant now = Instant.now();
        List<RefreshToken> activeTokens = refreshTokenRepository.findByTokenFamilyIdAndStatus(tokenFamilyId, RefreshTokenStatus.ACTIVE);
        for (RefreshToken activeToken : activeTokens) {
            activeToken.setStatus(RefreshTokenStatus.REVOKED);
            activeToken.setRevokedAt(now);
            activeToken.setRevokeReason(reason);
        }
        refreshTokenRepository.saveAll(activeTokens);
    }
}
