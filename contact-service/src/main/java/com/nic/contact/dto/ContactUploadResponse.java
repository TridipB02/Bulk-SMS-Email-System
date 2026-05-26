package com.nic.contact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ContactUploadResponse {
    private int totalRows;
    private int successCount;
    private int failedCount;
    private String message;
}