package com.yebapay.core.identity.auth;

import com.yebapay.core.identity.User;
import com.yebapay.core.notification.Notification;
import com.yebapay.core.notification.NotificationRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DevelopmentSmsSender {

    private static final Logger LOGGER = LoggerFactory.getLogger(DevelopmentSmsSender.class);

    private final NotificationRepository notificationRepository;

    public void sendPasswordResetOtp(User user, OtpChallenge otpChallenge, String otpCode) {
        String message = "YebaPay code de verification: " + otpCode + ". Il expire dans quelques minutes.";

        Notification notification = Notification.builder()
            .recipientUser(user)
            .notificationType("AUTH_OTP")
            .channel("SMS")
            .status("SENT")
            .title("YebaPay OTP")
            .body(message)
            .referenceType("OTP_CHALLENGE")
            .referenceId(otpChallenge.getId())
            .sentAt(Instant.now())
            .metadata(new LinkedHashMap<>())
            .build();

        notificationRepository.save(notification);
        LOGGER.info("DEV_SMS phone={} otpCode={} purpose={}", user.getPhoneNumber(), otpCode, otpChallenge.getPurpose());
    }
}
