package com.yebapay.core.merchant;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.merchant.dto.CreateMerchantProfileRequest;
import com.yebapay.core.merchant.dto.MerchantProfileResponse;
import com.yebapay.core.qr.dto.QrTokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/merchants")
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    @PostMapping("/me/profile")
    public MerchantProfileResponse createOrUpdateProfile(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CreateMerchantProfileRequest request
    ) {
        return merchantService.createOrUpdateCurrentUserMerchantProfile(principal.getUserId(), request);
    }

    @GetMapping("/me/profile")
    public MerchantProfileResponse currentProfile(@AuthenticationPrincipal AuthenticatedUser principal) {
        return merchantService.currentUserMerchantProfile(principal.getUserId());
    }

    @PostMapping("/me/static-qr")
    public QrTokenResponse generateStaticQr(@AuthenticationPrincipal AuthenticatedUser principal) {
        return merchantService.generateStaticQrForCurrentMerchant(principal.getUserId());
    }
}
