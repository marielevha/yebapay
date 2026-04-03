package com.yebapay.core.identity.auth.dto;

import com.yebapay.core.identity.KycLevel;
import com.yebapay.core.identity.RoleCode;
import com.yebapay.core.identity.UserStatus;
import com.yebapay.core.wallet.WalletStatus;
import com.yebapay.core.wallet.WalletType;
import java.util.List;
import java.util.UUID;

public record CurrentUserResponse(
    UUID id,
    String publicId,
    String phoneNumber,
    String email,
    String displayName,
    UserStatus status,
    KycLevel kycLevel,
    List<RoleCode> roles,
    UUID merchantProfileId,
    UUID agentProfileId,
    List<WalletSummary> wallets
) {

    public record WalletSummary(
        UUID id,
        String walletNumber,
        WalletType walletType,
        WalletStatus status,
        String currencyCode,
        String currencyDisplayCode,
        String currencyDisplayName
    ) {
    }
}
