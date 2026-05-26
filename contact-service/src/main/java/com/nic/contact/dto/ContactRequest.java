package com.nic.contact.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String phoneNumber;
    private String email;
}