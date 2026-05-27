package com.nic.messaging.dto;

import com.nic.messaging.entity.MessageLog;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageLogDTO {
    private Long id;
    private Long campaignId;
    private String recipient;
    private String message;
    private String type;
    private String status;
    private String failureReason;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;

    public static MessageLogDTO from(MessageLog log) {
        MessageLogDTO dto = new MessageLogDTO();
        dto.setId(log.getId());
        dto.setCampaignId(log.getCampaignId());
        dto.setRecipient(log.getRecipient());
        dto.setMessage(log.getMessage());
        dto.setType(log.getType().name());
        dto.setStatus(log.getStatus().name());
        dto.setFailureReason(log.getFailureReason());
        dto.setSentAt(log.getSentAt());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}