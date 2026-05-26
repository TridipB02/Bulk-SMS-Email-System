package com.nic.contact.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactGroupRequest {
    @NotBlank
    private String name;
    private String description;
}