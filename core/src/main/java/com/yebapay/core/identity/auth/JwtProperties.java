package com.yebapay.core.identity.auth;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "yebapay.security.jwt")
public class JwtProperties {

    private String issuer = "yebapay-core";
    private String secret = "c29tZS12ZXJ5LWxvbmctZGV2LWp3dC1zZWNyZXQtcGxlYXNlLWNoYW5nZS1tZQ==";
    private Duration accessTokenTtl = Duration.ofHours(24);
}
