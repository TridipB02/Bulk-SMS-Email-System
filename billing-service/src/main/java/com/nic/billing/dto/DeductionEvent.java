package com.nic.billing.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DeductionEvent {
    private Long userId;
    private Integer amount;
    private String description;
}