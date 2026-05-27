package com.nic.billing.dto;

import com.nic.billing.entity.CreditAccount;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreditAccountDTO {
    private Long id;
    private Long userId;
    private Integer credits;
    private LocalDateTime updatedAt;

    public static CreditAccountDTO from(CreditAccount account) {
        CreditAccountDTO dto = new CreditAccountDTO();
        dto.setId(account.getId());
        dto.setUserId(account.getUserId());
        dto.setCredits(account.getCredits());
        dto.setUpdatedAt(account.getUpdatedAt());
        return dto;
    }
}