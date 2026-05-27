package com.nic.report.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CampaignDTO {
    private Long id;
    private String name;
    private String message;
    private Long createdBy;
    private Long groupId;
    private String status;
    private String type;
    private LocalDateTime scheduledAt;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}