package com.nic.messaging.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class BillingServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.billing-service.url:http://localhost:8086}")
    private String billingServiceUrl;

    public Integer getBalance(Long userId) {
        try {
            Map response = restTemplate.getForObject(
                    billingServiceUrl + "/api/billing/internal/balance/" + userId,
                    Map.class
            );
            return response != null ? (Integer) response.get("credits") : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}