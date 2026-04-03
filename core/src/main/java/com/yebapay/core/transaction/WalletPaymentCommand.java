package com.yebapay.core.transaction;

import com.yebapay.core.fee.FeeQuote;
import com.yebapay.core.identity.User;
import com.yebapay.core.merchant.MerchantProfile;
import com.yebapay.core.qr.QrToken;
import com.yebapay.core.wallet.Wallet;
import java.math.BigDecimal;

public record WalletPaymentCommand(
    TransactionType transactionType,
    TransactionChannel channel,
    Wallet sourceWallet,
    Wallet destinationWallet,
    User initiatorUser,
    User payerUser,
    User payeeUser,
    MerchantProfile merchantProfile,
    QrToken qrToken,
    MoneyRequest moneyRequest,
    String idempotencyKey,
    BigDecimal amount,
    FeeQuote feeQuote,
    String description
) {
}
