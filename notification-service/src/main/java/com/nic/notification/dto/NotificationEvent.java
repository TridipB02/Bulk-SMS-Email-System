package com.nic.notification.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class NotificationEvent {
    private Long userId;
    private Long campaignId;
    private String message;
    private String type;
}