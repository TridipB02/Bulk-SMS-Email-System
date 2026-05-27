package com.nic.report.dto;

import lombok.Data;
import java.util.List;

@Data
public class DeliveryReportDTO {
    private Long campaignId;
    private String campaignName;
    private String status;
    private String type;
    private long totalSent;
    private long totalFailed;
    private long totalMessages;
    private double successRate;
    private List<MessageLogDTO> logs;
}