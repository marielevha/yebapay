package com.yebapay.core.transaction;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.transaction.dto.MerchantPaymentQuoteRequest;
import com.yebapay.core.transaction.dto.MerchantPaymentQuoteResponse;
import com.yebapay.core.transaction.dto.MerchantPaymentRequest;
import com.yebapay.core.transaction.dto.MerchantPaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/merchant-payments")
@RequiredArgsConstructor
public class MerchantPaymentController {

    private final MerchantPaymentService merchantPaymentService;

    @PostMapping("/quote")
    public MerchantPaymentQuoteResponse quote(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody MerchantPaymentQuoteRequest request
    ) {
        return merchantPaymentService.quote(principal.getUserId(), request);
    }

    @PostMapping
    public MerchantPaymentResponse pay(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody MerchantPaymentRequest request
    ) {
        return merchantPaymentService.pay(principal.getUserId(), request);
    }
}
