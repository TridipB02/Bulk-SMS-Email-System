package com.nic.campaign.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class ContactServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.contact-service.url}")
    private String contactServiceUrl;

    public Long getContactCount(Long groupId) {
        try {
            return restTemplate.getForObject(
                    contactServiceUrl + "/api/contacts/internal/groups/" + groupId + "/count",
                    Long.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch contact count: " + e.getMessage());
        }
    }
}