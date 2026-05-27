package com.nic.messaging.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ContactServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.contact-service.url}")
    private String contactServiceUrl;

    public List<String> getPhoneNumbers(Long groupId) {
        try {
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    contactServiceUrl + "/api/contacts/internal/groups/" + groupId + "/phones",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<String>>() {}
            );

            return response.getBody() != null
                    ? response.getBody()
                    : Collections.emptyList();

        } catch (Exception e) {
            throw new RuntimeException("Could not fetch phone numbers: " + e.getMessage());
        }
    }

    public List<String> getEmails(Long groupId) {
        try {
            ResponseEntity<List<String>> response = restTemplate.exchange(
                    contactServiceUrl + "/api/contacts/internal/groups/" + groupId + "/emails",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<String>>() {}
            );

            return response.getBody() != null
                    ? response.getBody()
                    : Collections.emptyList();

        } catch (Exception e) {
            throw new RuntimeException("Could not fetch emails: " + e.getMessage());
        }
    }
}