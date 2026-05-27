package com.nic.notification.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    public String getUserEmail(Long userId) {
        try {
            var response = restTemplate.getForObject(
                    userServiceUrl + "/api/users/internal/" + userId,
                    java.util.Map.class
            );
            return response != null ? (String) response.get("email") : null;
        } catch (Exception e) {
            return null;
        }
    }
}