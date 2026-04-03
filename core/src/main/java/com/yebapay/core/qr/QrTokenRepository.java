package com.yebapay.core.qr;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QrTokenRepository extends JpaRepository<QrToken, UUID> {

    Optional<QrToken> findByQrRef(String qrRef);

    Optional<QrToken> findByNonce(String nonce);

    Optional<QrToken> findTopByMoneyRequest_IdOrderByCreatedAtDesc(UUID moneyRequestId);
}
