package com.nic.billing.dto;

import com.nic.billing.entity.BillingTransaction;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Long id;
    private Long userId;
    private Integer amount;
    private String type;
    private String description;
    private Integer balanceAfter;
    private LocalDateTime createdAt;

    public static TransactionDTO from(BillingTransaction t) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(t.getId());
        dto.setUserId(t.getUserId());
        dto.setAmount(t.getAmount());
        dto.setType(t.getType().name());
        dto.setDescription(t.getDescription());
        dto.setBalanceAfter(t.getBalanceAfter());
        dto.setCreatedAt(t.getCreatedAt());
        return dto;
    }
}