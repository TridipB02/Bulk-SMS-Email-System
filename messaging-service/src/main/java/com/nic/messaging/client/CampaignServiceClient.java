package com.nic.messaging.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class CampaignServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.campaign-service.url}")
    private String campaignServiceUrl;

    public void updateCampaignStatus(Long campaignId, String status) {
        try {
            restTemplate.put(
                    campaignServiceUrl + "/api/campaigns/internal/" + campaignId + "/status?status=" + status,
                    null
            );
        } catch (Exception e) {
            // Log but don't fail — status update is best effort
            System.err.println("Warning: Could not update campaign status - " + e.getMessage());
        }
    }
}