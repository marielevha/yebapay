package com.yebapay.core.transaction;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.transaction.dto.AcceptMoneyRequestRequest;
import com.yebapay.core.transaction.dto.CreateMoneyRequestRequest;
import com.yebapay.core.transaction.dto.MoneyRequestDetailsResponse;
import com.yebapay.core.transaction.dto.MoneyRequestPaymentResponse;
import com.yebapay.core.transaction.dto.MoneyRequestQuoteRequest;
import com.yebapay.core.transaction.dto.MoneyRequestQuoteResponse;
import com.yebapay.core.transaction.dto.MoneyRequestResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/money-requests")
@RequiredArgsConstructor
public class MoneyRequestController {

    private final MoneyRequestService moneyRequestService;

    @PostMapping
    public MoneyRequestResponse create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CreateMoneyRequestRequest request
    ) {
        return moneyRequestService.create(principal.getUserId(), request);
    }

    @GetMapping("/me")
    public List<MoneyRequestResponse> mine(@AuthenticationPrincipal AuthenticatedUser principal) {
        return moneyRequestService.listForUser(principal.getUserId());
    }

    @GetMapping("/{requestRef}")
    public MoneyRequestDetailsResponse details(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable String requestRef
    ) {
        return moneyRequestService.getDetails(principal.getUserId(), requestRef);
    }

    @PostMapping("/{requestRef}/quote")
    public MoneyRequestQuoteResponse quote(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable String requestRef,
        @Valid @RequestBody(required = false) MoneyRequestQuoteRequest request
    ) {
        return moneyRequestService.quote(principal.getUserId(), requestRef, request);
    }

    @PostMapping("/{requestRef}/accept")
    public MoneyRequestPaymentResponse accept(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable String requestRef,
        @Valid @RequestBody AcceptMoneyRequestRequest request
    ) {
        return moneyRequestService.accept(principal.getUserId(), requestRef, request);
    }

    @PostMapping("/{requestRef}/decline")
    public MoneyRequestResponse decline(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable String requestRef
    ) {
        return moneyRequestService.decline(principal.getUserId(), requestRef);
    }

    @PostMapping("/{requestRef}/cancel")
    public MoneyRequestResponse cancel(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable String requestRef
    ) {
        return moneyRequestService.cancel(principal.getUserId(), requestRef);
    }
}
