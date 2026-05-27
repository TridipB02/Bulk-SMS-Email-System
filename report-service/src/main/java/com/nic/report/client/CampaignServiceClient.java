package com.nic.report.client;

import com.nic.report.dto.CampaignDTO;
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

    public CampaignDTO getCampaign(Long campaignId) {
        try {
            return restTemplate.getForObject(
                    campaignServiceUrl + "/api/campaigns/internal/" + campaignId,
                    CampaignDTO.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch campaign: " + e.getMessage());
        }
    }
}