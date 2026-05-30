package com.nic.auth.dto;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}