package com.yebapay.core.transaction;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.transaction.dto.P2pTransferQuoteRequest;
import com.yebapay.core.transaction.dto.P2pTransferQuoteResponse;
import com.yebapay.core.transaction.dto.P2pTransferRequest;
import com.yebapay.core.transaction.dto.P2pTransferResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    @PostMapping("/p2p/quote")
    public P2pTransferQuoteResponse quoteP2pTransfer(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody P2pTransferQuoteRequest request
    ) {
        return transferService.quoteP2pTransfer(principal.getUserId(), request);
    }

    @PostMapping("/p2p")
    public P2pTransferResponse executeP2pTransfer(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody P2pTransferRequest request
    ) {
        return transferService.executeP2pTransfer(principal.getUserId(), request);
    }
}
