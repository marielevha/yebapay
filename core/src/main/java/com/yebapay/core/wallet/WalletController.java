package com.yebapay.core.wallet;

import com.yebapay.core.identity.auth.AuthenticatedUser;
import com.yebapay.core.transaction.TransferService;
import com.yebapay.core.transaction.dto.TransactionSummaryResponse;
import com.yebapay.core.wallet.dto.WalletDetailsResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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
    public List<TransactionSummaryResponse> currentUserTransactions(@AuthenticationPrincipal AuthenticatedUser principal) {
        return transferService.getRecentTransactions(principal.getUserId());
    }
}
