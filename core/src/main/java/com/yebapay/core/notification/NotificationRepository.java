package com.yebapay.core.notification;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findTop50ByRecipientUser_IdOrderByCreatedAtDesc(UUID recipientUserId);
}
