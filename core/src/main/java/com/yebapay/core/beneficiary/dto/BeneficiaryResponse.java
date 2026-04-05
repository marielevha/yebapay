package com.yebapay.core.beneficiary.dto;

import java.time.Instant;
import java.util.UUID;

public record BeneficiaryResponse(
    UUID id,
    String displayName,
    String walletNumber,
    UUID beneficiaryUserId,
    String beneficiaryUserDisplayName,
    Instant lastUsedAt
) {
}
