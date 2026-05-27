package com.nic.report.client;

import com.nic.report.dto.MessageLogDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MessagingServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.messaging-service.url}")
    private String messagingServiceUrl;

    public List<MessageLogDTO> getLogsByCampaign(Long campaignId) {
        try {
            ResponseEntity<List<MessageLogDTO>> response = restTemplate.exchange(
                    messagingServiceUrl + "/api/messages/internal/campaign/" + campaignId + "/logs",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<MessageLogDTO>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch message logs: " + e.getMessage());
        }
    }

    public Map<String, Long> getStatsByCampaign(Long campaignId) {
        try {
            ResponseEntity<Map<String, Long>> response = restTemplate.exchange(
                    messagingServiceUrl + "/api/messages/internal/campaign/" + campaignId + "/stats",
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Long>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyMap();
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch stats: " + e.getMessage());
        }
    }
}