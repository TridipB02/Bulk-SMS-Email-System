package com.nic.contact.dto;

import com.nic.contact.entity.Contact;
import lombok.Data;

@Data
public class ContactDTO {
    private Long id;
    private String name;
    private String phoneNumber;
    private String email;
    private Long groupId;

    public static ContactDTO from(Contact contact) {
        ContactDTO dto = new ContactDTO();
        dto.setId(contact.getId());
        dto.setName(contact.getName());
        dto.setPhoneNumber(contact.getPhoneNumber());
        dto.setEmail(contact.getEmail());
        dto.setGroupId(contact.getGroup().getId());
        return dto;
    }
}