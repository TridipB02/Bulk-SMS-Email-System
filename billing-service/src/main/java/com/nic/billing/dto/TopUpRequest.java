package com.nic.billing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TopUpRequest {
    @NotNull
    private Long userId;

    @Min(1)
    private Integer amount;

    private String description = "Manual top-up";
}