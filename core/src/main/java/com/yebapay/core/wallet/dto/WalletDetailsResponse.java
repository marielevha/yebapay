package com.yebapay.core.wallet.dto;

import com.yebapay.core.wallet.WalletStatus;
import com.yebapay.core.wallet.WalletType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WalletDetailsResponse(
    UUID id,
    String walletNumber,
    WalletType walletType,
    WalletStatus status,
    String currencyCode,
    String currencyDisplayCode,
    String currencyDisplayName,
    BigDecimal availableBalance,
    BigDecimal pendingBalance,
    BigDecimal ledgerBalance,
    BigDecimal dailyLimit,
    BigDecimal monthlyLimit,
    Instant lastActivityAt
) {
}
