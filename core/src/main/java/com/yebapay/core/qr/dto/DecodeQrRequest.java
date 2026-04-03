package com.yebapay.core.qr.dto;

import jakarta.validation.constraints.NotBlank;

public record DecodeQrRequest(
    @NotBlank
    String qrData
) {
}
