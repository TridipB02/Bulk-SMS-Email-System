package com.nic.messaging.controller;

import com.nic.messaging.dto.MessageLogDTO;
import com.nic.messaging.security.JwtUtil;
import com.nic.messaging.service.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;
    private final JwtUtil jwtUtil;

    // Get logs for a specific campaign
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<MessageLogDTO>> getByCampaign(@PathVariable Long campaignId) {
        return ResponseEntity.ok(messagingService.getLogsByCampaign(campaignId));
    }

    // Get my message logs
    @GetMapping("/my")
    public ResponseEntity<List<MessageLogDTO>> getMyLogs(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(messagingService.getMyLogs(userId));
    }

    // Get stats for a campaign
    @GetMapping("/campaign/{campaignId}/stats")
    public ResponseEntity<Map<String, Long>> getCampaignStats(@PathVariable Long campaignId) {
        return ResponseEntity.ok(messagingService.getCampaignStats(campaignId));
    }

    // Internal — called by report-service
    @GetMapping("/internal/campaign/{campaignId}/logs")
    public ResponseEntity<List<MessageLogDTO>> getLogsInternal(@PathVariable Long campaignId) {
        return ResponseEntity.ok(messagingService.getLogsByCampaign(campaignId));
    }

    @GetMapping("/internal/campaign/{campaignId}/stats")
    public ResponseEntity<Map<String, Long>> getStatsInternal(@PathVariable Long campaignId) {
        return ResponseEntity.ok(messagingService.getCampaignStats(campaignId));
    }
}