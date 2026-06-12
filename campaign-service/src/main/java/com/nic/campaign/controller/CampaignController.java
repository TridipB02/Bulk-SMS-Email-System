package com.nic.campaign.controller;

import com.nic.campaign.dto.*;
import com.nic.campaign.security.JwtUtil;
import com.nic.campaign.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;
    private final JwtUtil jwtUtil;

    // ─── MAKER endpoints ──────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('MAKER','ADMIN')")
    public ResponseEntity<CampaignDTO> createCampaign(
            @Valid @RequestBody CampaignRequest req,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.createCampaign(req, userId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAKER','ADMIN')")
    public ResponseEntity<CampaignDTO> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest req,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.updateCampaign(id, req, userId));
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('MAKER','ADMIN')")
    public ResponseEntity<CampaignDTO> submitToChecker(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.submitToChecker(id, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAKER','ADMIN')")
    public ResponseEntity<String> deleteCampaign(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        campaignService.deleteCampaign(id, userId);
        return ResponseEntity.ok("Campaign deleted");
    }

    // ─── CHECKER endpoints ────────────────────────────────

    @PutMapping("/{id}/check")
    @PreAuthorize("hasAnyRole('CHECKER','ADMIN')")
    public ResponseEntity<CampaignDTO> checkCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.checkCampaign(id));
    }

    @PutMapping("/{id}/reject-checker")
    @PreAuthorize("hasAnyRole('CHECKER','ADMIN')")
    public ResponseEntity<CampaignDTO> rejectByChecker(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.rejectByChecker(id));
    }

    // ─── APPROVER endpoints ───────────────────────────────

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('APPROVER','ADMIN')")
    public ResponseEntity<CampaignDTO> approveCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.approveCampaign(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('APPROVER','ADMIN')")
    public ResponseEntity<CampaignDTO> rejectByApprover(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.rejectByApprover(id));
    }

    // ─── ADMIN endpoints ──────────────────────────────────

    @PutMapping("/{id}/admin-approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignDTO> adminApprove(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.adminApprove(id));
    }

    @PutMapping("/{id}/admin-reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignDTO> adminReject(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.adminReject(id));
    }

    // ─── Common endpoints ─────────────────────────────────

    @GetMapping("/my")
    public ResponseEntity<List<CampaignDTO>> getMyCampaigns(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.getMyCampaigns(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampaignDTO> getCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CHECKER','APPROVER')")
    public ResponseEntity<List<CampaignDTO>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','CHECKER','APPROVER')")
    public ResponseEntity<List<CampaignDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(campaignService.getCampaignsByStatus(status));
    }

    // ─── Internal endpoints ───────────────────────────────

    @GetMapping("/internal/{id}")
    public ResponseEntity<CampaignDTO> getCampaignInternal(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @PutMapping("/internal/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        campaignService.updateCampaignStatus(id, status);
        return ResponseEntity.ok().build();
    }
}