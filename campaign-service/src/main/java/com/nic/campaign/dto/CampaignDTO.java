package com.nic.campaign.dto;

import com.nic.campaign.entity.Campaign;
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

    public static CampaignDTO from(Campaign c) {
        CampaignDTO dto = new CampaignDTO();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setMessage(c.getMessage());
        dto.setCreatedBy(c.getCreatedBy());
        dto.setGroupId(c.getGroupId());
        dto.setStatus(c.getStatus().name());
        dto.setType(c.getType().name());
        dto.setScheduledAt(c.getScheduledAt());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setSentAt(c.getSentAt());
        return dto;
    }
}