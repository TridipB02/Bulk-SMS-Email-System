package com.nic.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.user-service.url:http://localhost:8082}")
    private String userServiceUrl;

    public void createUserProfile(String name, String email, String role) {
        try {
            restTemplate.postForObject(
                    userServiceUrl + "/api/users/internal/create",
                    Map.of("name", name, "email", email, "role", role),
                    Object.class
            );
        } catch (Exception e) {
            // Log but don't fail registration if user-service is down
            System.err.println("Warning: Could not create user profile - " + e.getMessage());
        }
    }
}