package com.yebapay.core.identity.auth;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "yebapay.auth")
public class AuthProperties {

    private Duration refreshTokenTtl = Duration.ofDays(30);
    private Duration passwordResetOtpTtl = Duration.ofMinutes(10);
    private Duration passwordResetSessionTtl = Duration.ofMinutes(15);
    private Duration otpResendCooldown = Duration.ofSeconds(30);
    private int otpLength = 6;
    private int otpMaxAttempts = 5;
}
