package com.nic.report.controller;

import com.nic.report.dto.DeliveryReportDTO;
import com.nic.report.dto.MessageLogDTO;
import com.nic.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // Full delivery report for a campaign
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<DeliveryReportDTO> getCampaignReport(
            @PathVariable Long campaignId) {
        return ResponseEntity.ok(reportService.getCampaignReport(campaignId));
    }

    // Raw message logs for a campaign
    @GetMapping("/campaign/{campaignId}/logs")
    public ResponseEntity<List<MessageLogDTO>> getRawLogs(
            @PathVariable Long campaignId) {
        return ResponseEntity.ok(reportService.getRawLogs(campaignId));
    }

    // Admin only — full report
    @GetMapping("/admin/campaign/{campaignId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryReportDTO> getAdminReport(
            @PathVariable Long campaignId) {
        return ResponseEntity.ok(reportService.getCampaignReport(campaignId));
    }
}