package com.nic.notification.dto;

import com.nic.notification.entity.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String message;
    private String type;
    private Long campaignId;
    private boolean isRead;
    private boolean emailSent;
    private LocalDateTime createdAt;

    public static NotificationDTO from(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setUserId(n.getUserId());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setCampaignId(n.getCampaignId());
        dto.setRead(n.isRead());
        dto.setEmailSent(n.isEmailSent());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}