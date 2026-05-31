package com.nic.notification.service;

import com.nic.notification.client.UserServiceClient;
import com.nic.notification.config.RabbitMQConfig;
import com.nic.notification.dto.NotificationDTO;
import com.nic.notification.dto.NotificationEvent;
import com.nic.notification.entity.Notification;
import com.nic.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserServiceClient userServiceClient;
    private final EmailService emailService;

    // ─── RabbitMQ Consumer ────────────────────────────────

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleNotificationEvent(Map<String, Object> eventMap) {
        log.info("Received notification event: {}", eventMap);

        try {
            Long userId = Long.valueOf(eventMap.get("userId").toString());
            Long campaignId = Long.valueOf(eventMap.get("campaignId").toString());
            String message = eventMap.get("message").toString();
            String type = eventMap.get("type").toString();

            // Save notification to DB
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setMessage(message);
            notification.setType(type);
            notification.setCampaignId(campaignId);
            notificationRepository.save(notification);

            // Fetch user email from user-service and send real email
            String userEmail = userServiceClient.getUserEmail(userId);
            if (userEmail != null) {
                emailService.sendNotificationEmail(
                        userEmail,
                        "Campaign Completed — Bulk SMS System",
                        message
                );
                notification.setEmailSent(true);
                notificationRepository.save(notification);
                log.info("Email notification sent to {}", userEmail);
            } else {
                log.warn("Could not find email for userId={}", userId);
            }

        } catch (Exception e) {
            log.error("Failed to process notification event: {}", e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.LOW_BALANCE_QUEUE)
    public void handleLowBalanceAlert(Map<String, Object> eventMap) {
        log.info("Received low balance alert: {}", eventMap);

        try {
            Long userId = Long.valueOf(eventMap.get("userId").toString());
            String message = eventMap.get("message").toString();
            String type = eventMap.get("type").toString();

            // Save notification to DB
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setMessage(message);
            notification.setType(type);
            notificationRepository.save(notification);

            // Fetch user email and send alert
            String userEmail = userServiceClient.getUserEmail(userId);
            if (userEmail != null) {
                emailService.sendNotificationEmail(
                        userEmail,
                        "⚠️ Low Credit Balance — Bulk SMS System",
                        message
                );
                notification.setEmailSent(true);
                notificationRepository.save(notification);
                log.info("Low balance alert email sent to {}", userEmail);
            }

        } catch (Exception e) {
            log.error("Failed to process low balance alert: {}", e.getMessage());
        }
    }

    // ─── REST ─────────────────────────────────────────────

    public List<NotificationDTO> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDTO::from)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId)
                .stream()
                .map(NotificationDTO::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }
}