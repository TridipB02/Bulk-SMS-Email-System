package com.nic.report.dto;

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
}