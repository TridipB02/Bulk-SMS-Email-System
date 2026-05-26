package com.nic.campaign.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CampaignRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String message;

    @NotNull
    private Long groupId;

    private String type = "SMS";

    private LocalDateTime scheduledAt;
}