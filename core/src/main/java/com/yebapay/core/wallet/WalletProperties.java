package com.yebapay.core.wallet;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "yebapay.wallet")
public class WalletProperties {

    private String defaultCurrency = "XAF";
    private String personalWalletName = "Main Wallet";
    private String merchantWalletName = "Merchant Wallet";
    private BigDecimal personalDailyLimit = new BigDecimal("1000000");
    private BigDecimal personalMonthlyLimit = new BigDecimal("10000000");
    private BigDecimal merchantDailyLimit = new BigDecimal("5000000");
    private BigDecimal merchantMonthlyLimit = new BigDecimal("50000000");
}
