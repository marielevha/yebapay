package com.yebapay.core.transaction;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.transaction.dto.CashInQuoteRequest;
import com.yebapay.core.transaction.dto.CashInQuoteResponse;
import com.yebapay.core.transaction.dto.CashInRequest;
import com.yebapay.core.transaction.dto.CashInResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cash-operations")
@RequiredArgsConstructor
public class CashInController {

    private final CashInService cashInService;

    @PostMapping("/cash-in/quote")
    public CashInQuoteResponse quote(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CashInQuoteRequest request
    ) {
        return cashInService.quote(principal, request);
    }

    @PostMapping("/cash-in")
    public CashInResponse execute(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CashInRequest request
    ) {
        return cashInService.execute(principal, request);
    }
}
