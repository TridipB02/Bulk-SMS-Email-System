package com.nic.report.service;

import com.nic.report.client.CampaignServiceClient;
import com.nic.report.client.MessagingServiceClient;
import com.nic.report.dto.CampaignDTO;
import com.nic.report.dto.DeliveryReportDTO;
import com.nic.report.dto.MessageLogDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final MessagingServiceClient messagingServiceClient;
    private final CampaignServiceClient campaignServiceClient;

    public DeliveryReportDTO getCampaignReport(Long campaignId) {
        // Fetch campaign details from campaign-service
        CampaignDTO campaign = campaignServiceClient.getCampaign(campaignId);

        // Fetch message logs from messaging-service
        List<MessageLogDTO> logs = messagingServiceClient.getLogsByCampaign(campaignId);

        // Fetch stats
        Map<String, Long> stats = messagingServiceClient.getStatsByCampaign(campaignId);

        long sent = stats.getOrDefault("sent", 0L);
        long failed = stats.getOrDefault("failed", 0L);
        long total = stats.getOrDefault("total", 0L);
        double successRate = total > 0 ? ((double) sent / total) * 100 : 0;

        // Build report
        DeliveryReportDTO report = new DeliveryReportDTO();
        report.setCampaignId(campaignId);
        report.setCampaignName(campaign != null ? campaign.getName() : "Unknown");
        report.setStatus(campaign != null ? campaign.getStatus() : "Unknown");
        report.setType(campaign != null ? campaign.getType() : "Unknown");
        report.setTotalSent(sent);
        report.setTotalFailed(failed);
        report.setTotalMessages(total);
        report.setSuccessRate(Math.round(successRate * 100.0) / 100.0);
        report.setLogs(logs);

        return report;
    }

    public List<MessageLogDTO> getRawLogs(Long campaignId) {
        return messagingServiceClient.getLogsByCampaign(campaignId);
    }
}