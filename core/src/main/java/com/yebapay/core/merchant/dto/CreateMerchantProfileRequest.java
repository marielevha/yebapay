package com.yebapay.core.merchant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMerchantProfileRequest(
    @NotBlank
    @Size(max = 150)
    String businessName,

    @Size(max = 150)
    String displayName,

    @Size(max = 50)
    String merchantCategoryCode,

    @Size(max = 255)
    String addressLine1,

    @Size(max = 100)
    String city
) {
}
