package com.yebapay.core.transaction;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "yebapay.transaction")
public class TransactionSecurityProperties {

    private int pinMaxAttempts = 5;
    private Duration pinLockDuration = Duration.ofMinutes(15);
}
