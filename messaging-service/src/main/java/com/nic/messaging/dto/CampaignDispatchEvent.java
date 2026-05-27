package com.nic.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CampaignDispatchEvent {
    private Long campaignId;
    private Long groupId;
    private String message;
    private String type;
    private Long createdBy;
}