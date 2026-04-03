package com.yebapay.core.qr;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "yebapay.qr")
public class QrProperties {

    private String secret = "change-me-qr-secret";
    private Duration personalQrTtl = Duration.ofDays(3650);
    private Duration merchantStaticQrTtl = Duration.ofDays(3650);
    private Duration moneyRequestQrTtl = Duration.ofHours(24);
}
