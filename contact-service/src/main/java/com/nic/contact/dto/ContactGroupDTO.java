package com.nic.contact.dto;

import com.nic.contact.entity.ContactGroup;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContactGroupDTO {
    private Long id;
    private String name;
    private String description;
    private Long createdBy;
    private long contactCount;
    private LocalDateTime createdAt;

    public static ContactGroupDTO from(ContactGroup group, long contactCount) {
        ContactGroupDTO dto = new ContactGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setContactCount(contactCount);
        dto.setCreatedAt(group.getCreatedAt());
        return dto;
    }
}