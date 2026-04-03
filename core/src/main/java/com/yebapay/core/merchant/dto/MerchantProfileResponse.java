package com.yebapay.core.merchant.dto;

import java.util.UUID;

public record MerchantProfileResponse(
    UUID id,
    String merchantCode,
    String businessName,
    String displayName,
    String merchantCategoryCode,
    String status,
    String settlementMode,
    UUID settlementWalletId,
    String settlementWalletNumber
) {
}
