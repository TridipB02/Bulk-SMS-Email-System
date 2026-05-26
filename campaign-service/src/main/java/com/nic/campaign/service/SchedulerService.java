package com.nic.campaign.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final CampaignService campaignService;

    // Runs every minute — checks for scheduled campaigns due for dispatch
    @Scheduled(fixedRate = 60000)
    public void checkScheduledCampaigns() {
        log.info("Checking for scheduled campaigns...");
        campaignService.dispatchScheduledCampaigns();
    }
}