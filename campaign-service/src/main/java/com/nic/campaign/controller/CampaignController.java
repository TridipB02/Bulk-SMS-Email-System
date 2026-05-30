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

    // User creates a campaign
    @PostMapping
    public ResponseEntity<CampaignDTO> createCampaign(
            @Valid @RequestBody CampaignRequest req,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.createCampaign(req, userId));
    }

    // User gets their own campaigns
    @GetMapping("/my")
    public ResponseEntity<List<CampaignDTO>> getMyCampaigns(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.getMyCampaigns(userId));
    }

    // Get single campaign
    @GetMapping("/{id}")
    public ResponseEntity<CampaignDTO> getCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    // Admin gets all campaigns
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CampaignDTO>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    // Admin approves campaign — triggers RabbitMQ dispatch
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignDTO> approveCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.approveCampaign(id));
    }

    // Admin rejects campaign
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CampaignDTO> rejectCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.rejectCampaign(id));
    }

    // Internal — called by messaging-service to update status
    @PutMapping("/internal/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        campaignService.updateCampaignStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // Internal — called by report-service without token
    @GetMapping("/internal/{id}")
    public ResponseEntity<CampaignDTO> getCampaignInternal(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    // Edit draft campaign
    @PutMapping("/{id}")
    public ResponseEntity<CampaignDTO> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest req,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.updateCampaign(id, req, userId));
    }

    // Submit draft for approval
    @PutMapping("/{id}/submit")
    public ResponseEntity<CampaignDTO> submitForApproval(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(campaignService.submitForApproval(id, userId));
    }

    // Delete draft campaign
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCampaign(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        campaignService.deleteCampaign(id, userId);
        return ResponseEntity.ok("Campaign deleted");
    }
}