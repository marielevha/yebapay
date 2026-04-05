package com.yebapay.core.wallet;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.transaction.TransactionType;
import com.yebapay.core.transaction.TransferService;
import com.yebapay.core.transaction.dto.TransactionSummaryResponse;
import com.yebapay.core.wallet.dto.WalletDetailsResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final TransferService transferService;

    @GetMapping("/me")
    public List<WalletDetailsResponse> currentUserWallets(@AuthenticationPrincipal AuthenticatedUser principal) {
        return walletService.getCurrentUserWallets(principal.getUserId());
    }

    @GetMapping("/me/transactions")
    public List<TransactionSummaryResponse> currentUserTransactions(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestParam(required = false) UUID walletId,
        @RequestParam(required = false) TransactionType transactionType
    ) {
        return transferService.getTransactionHistory(principal.getUserId(), page, size, walletId, transactionType);
    }

    @GetMapping("/me/home-transactions")
    public List<TransactionSummaryResponse> currentUserHomeTransactions(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestParam UUID walletId,
        @RequestParam(defaultValue = "10") int size
    ) {
        return transferService.getHomeTransactions(principal.getUserId(), walletId, size);
    }
}
