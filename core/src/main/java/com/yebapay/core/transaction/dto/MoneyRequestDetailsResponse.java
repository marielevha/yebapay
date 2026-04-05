package com.yebapay.core.transaction.dto;

import com.yebapay.core.qr.dto.QrTokenResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MoneyRequestDetailsResponse(
    UUID id,
    String requestRef,
    String status,
    String requesterDisplayName,
    String requesterPhoneNumber,
    String payerDisplayName,
    String payerPhoneNumber,
    String targetWalletNumber,
    BigDecimal amount,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    String reason,
    Instant createdAt,
    Instant expiresAt,
    Instant paidAt,
    boolean viewerIsRequester,
    boolean payableByViewer,
    boolean cancelableByViewer,
    boolean declinableByViewer,
    QrTokenResponse qr
) {
}
