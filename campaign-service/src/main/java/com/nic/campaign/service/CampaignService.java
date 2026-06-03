package com.nic.campaign.service;

import com.nic.campaign.client.ContactServiceClient;
import com.nic.campaign.config.RabbitMQConfig;
import com.nic.campaign.dto.*;
import com.nic.campaign.entity.Campaign;
import com.nic.campaign.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ContactServiceClient contactServiceClient;

    public CampaignDTO createCampaign(CampaignRequest req, Long userId) {
        // Validate group has contacts
        Long count = contactServiceClient.getContactCount(req.getGroupId());
        if (count == 0) {
            throw new RuntimeException("Group has no contacts");
        }

        Campaign campaign = new Campaign();
        campaign.setName(req.getName());
        campaign.setMessage(req.getMessage());
        campaign.setCreatedBy(userId);
        campaign.setGroupId(req.getGroupId());
        campaign.setType(Campaign.CampaignType.valueOf(req.getType()));

        if (req.getScheduledAt() != null) {
            // Convert from user's timezone to UTC for storage
            String tz = req.getTimezone() != null ? req.getTimezone() : "Asia/Kolkata";
            ZonedDateTime userTime = req.getScheduledAt()
                    .atZone(ZoneId.of(tz));
            ZonedDateTime utcTime = userTime.withZoneSameInstant(ZoneId.of("UTC"));
            campaign.setScheduledAt(utcTime.toLocalDateTime());
            campaign.setTimezone(tz);
            campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        } else {
            campaign.setStatus(Campaign.CampaignStatus.DRAFT);
        }

        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    public List<CampaignDTO> getMyCampaigns(Long userId) {
        return campaignRepository.findByCreatedBy(userId)
                .stream()
                .map(CampaignDTO::from)
                .collect(Collectors.toList());
    }

    public List<CampaignDTO> getAllCampaigns() {
        return campaignRepository.findAll()
                .stream()
                .map(CampaignDTO::from)
                .collect(Collectors.toList());
    }

    public CampaignDTO getCampaignById(Long id) {
        return CampaignDTO.from(campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found")));
    }

    // Admin approves campaign — publishes to RabbitMQ
    public CampaignDTO approveCampaign(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getScheduledAt() != null
                && campaign.getScheduledAt().isAfter(java.time.LocalDateTime.now())) {
            // Keep as SCHEDULED — dispatcher will fire it at the right time
            campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        } else {
            campaign.setStatus(Campaign.CampaignStatus.APPROVED);
            // Publish to RabbitMQ immediately
            CampaignDispatchEvent event = new CampaignDispatchEvent(
                    campaign.getId(),
                    campaign.getGroupId(),
                    campaign.getMessage(),
                    campaign.getType().name(),
                    campaign.getCreatedBy()
            );
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.CAMPAIGN_EXCHANGE,
                    RabbitMQConfig.CAMPAIGN_ROUTING_KEY,
                    event
            );
        }
        campaignRepository.save(campaign);

        // Publish event to messaging-service via RabbitMQ
        CampaignDispatchEvent event = new CampaignDispatchEvent(
                campaign.getId(),
                campaign.getGroupId(),
                campaign.getMessage(),
                campaign.getType().name(),
                campaign.getCreatedBy()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.CAMPAIGN_EXCHANGE,
                RabbitMQConfig.CAMPAIGN_ROUTING_KEY,
                event
        );

        return CampaignDTO.from(campaign);
    }

    // Admin rejects campaign
    public CampaignDTO rejectCampaign(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setStatus(Campaign.CampaignStatus.REJECTED);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // Called by scheduler — dispatch scheduled campaigns whose time has come
    public void dispatchScheduledCampaigns() {
        List<Campaign> due = campaignRepository
                .findByStatusAndScheduledAtBefore(
                        Campaign.CampaignStatus.SCHEDULED,
                        LocalDateTime.now()
                );

        for (Campaign campaign : due) {
            campaign.setStatus(Campaign.CampaignStatus.APPROVED);
            campaignRepository.save(campaign);

            CampaignDispatchEvent event = new CampaignDispatchEvent(
                    campaign.getId(),
                    campaign.getGroupId(),
                    campaign.getMessage(),
                    campaign.getType().name(),
                    campaign.getCreatedBy()
            );

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.CAMPAIGN_EXCHANGE,
                    RabbitMQConfig.CAMPAIGN_ROUTING_KEY,
                    event
            );
        }
    }

    // Internal — called by messaging-service to update status after sending
    public void updateCampaignStatus(Long id, String status) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setStatus(Campaign.CampaignStatus.valueOf(status));
        if (status.equals("SENT")) {
            campaign.setSentAt(LocalDateTime.now());
        }
        campaignRepository.save(campaign);
    }

    // Edit a draft campaign
    public CampaignDTO updateCampaign(Long id, CampaignRequest req, Long userId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        // Only owner can edit
        if (!campaign.getCreatedBy().equals(userId)) {
            throw new RuntimeException("You are not the owner of this campaign");
        }

        // Only DRAFT campaigns can be edited
        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT) {
            throw new RuntimeException(
                    "Only DRAFT campaigns can be edited. Current status: "
                            + campaign.getStatus());
        }

        // Validate group still has contacts
        Long count = contactServiceClient.getContactCount(req.getGroupId());
        if (count == 0) {
            throw new RuntimeException("Group has no contacts");
        }

        campaign.setName(req.getName());
        campaign.setMessage(req.getMessage());
        campaign.setGroupId(req.getGroupId());
        campaign.setType(Campaign.CampaignType.valueOf(req.getType()));

        if (req.getScheduledAt() != null) {
            String tz = req.getTimezone() != null ? req.getTimezone() : "Asia/Kolkata";
            ZonedDateTime userTime = req.getScheduledAt()
                    .atZone(ZoneId.of(tz));
            ZonedDateTime utcTime = userTime.withZoneSameInstant(ZoneId.of("UTC"));
            campaign.setScheduledAt(utcTime.toLocalDateTime());
            campaign.setTimezone(tz);
            campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        }

        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // Submit draft for approval
    public CampaignDTO submitForApproval(Long id, Long userId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!campaign.getCreatedBy().equals(userId)) {
            throw new RuntimeException("You are not the owner of this campaign");
        }

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT
                && campaign.getStatus() != Campaign.CampaignStatus.SCHEDULED) {
            throw new RuntimeException(
                    "Only DRAFT or SCHEDULED campaigns can be submitted. Current status: "
                            + campaign.getStatus());
        }

        campaign.setStatus(Campaign.CampaignStatus.PENDING_APPROVAL);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // Delete a draft campaign
    public void deleteCampaign(Long id, Long userId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!campaign.getCreatedBy().equals(userId)) {
            throw new RuntimeException("You are not the owner of this campaign");
        }

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT campaigns can be deleted");
        }

        campaignRepository.deleteById(id);
    }
}