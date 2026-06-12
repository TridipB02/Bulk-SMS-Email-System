package com.nic.campaign.service;

import com.nic.campaign.client.ContactServiceClient;
import com.nic.campaign.config.RabbitMQConfig;
import com.nic.campaign.dto.*;
import com.nic.campaign.entity.Campaign;
import com.nic.campaign.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ContactServiceClient contactServiceClient;

    // ─── MAKER operations ─────────────────────────────────

    public CampaignDTO createCampaign(CampaignRequest req, Long userId) {
        Long count = contactServiceClient.getContactCount(req.getGroupId());
        if (count == 0) throw new RuntimeException("Group has no contacts");

        Campaign campaign = new Campaign();
        campaign.setName(req.getName());
        campaign.setMessage(req.getMessage());
        campaign.setCreatedBy(userId);
        campaign.setGroupId(req.getGroupId());
        campaign.setType(Campaign.CampaignType.valueOf(req.getType()));

        if (req.getScheduledAt() != null) {
            String tz = req.getTimezone() != null ? req.getTimezone() : "Asia/Kolkata";
            java.time.ZonedDateTime userTime = req.getScheduledAt()
                    .atZone(java.time.ZoneId.of(tz));
            java.time.ZonedDateTime utcTime = userTime
                    .withZoneSameInstant(java.time.ZoneId.of("UTC"));
            campaign.setScheduledAt(utcTime.toLocalDateTime());
            campaign.setTimezone(tz);
            campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        } else {
            campaign.setStatus(Campaign.CampaignStatus.DRAFT);
        }

        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // MAKER submits to CHECKER
    public CampaignDTO submitToChecker(Long id, Long userId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!campaign.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Only the creator can submit this campaign");
        }

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT &&
            campaign.getStatus() != Campaign.CampaignStatus.SCHEDULED) {
            throw new RuntimeException("Only DRAFT campaigns can be submitted");
        }

        campaign.setStatus(Campaign.CampaignStatus.PENDING_CHECKER);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // MAKER edits draft
    public CampaignDTO updateCampaign(Long id, CampaignRequest req, Long userId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!campaign.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Only the creator can edit this campaign");
        }

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT campaigns can be edited");
        }

        Long count = contactServiceClient.getContactCount(req.getGroupId());
        if (count == 0) throw new RuntimeException("Group has no contacts");

        campaign.setName(req.getName());
        campaign.setMessage(req.getMessage());
        campaign.setGroupId(req.getGroupId());
        campaign.setType(Campaign.CampaignType.valueOf(req.getType()));

        if (req.getScheduledAt() != null) {
            String tz = req.getTimezone() != null ? req.getTimezone() : "Asia/Kolkata";
            java.time.ZonedDateTime userTime = req.getScheduledAt()
                    .atZone(java.time.ZoneId.of(tz));
            java.time.ZonedDateTime utcTime = userTime
                    .withZoneSameInstant(java.time.ZoneId.of("UTC"));
            campaign.setScheduledAt(utcTime.toLocalDateTime());
            campaign.setTimezone(tz);
        }

        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // MAKER deletes draft
    public void deleteCampaign(Long id, Long userId) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (!campaign.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Only the creator can delete this campaign");
        }

        if (campaign.getStatus() != Campaign.CampaignStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT campaigns can be deleted");
        }

        campaignRepository.deleteById(id);
    }

    // ─── CHECKER operations ───────────────────────────────

    // CHECKER marks as checked — passes to APPROVER
    public CampaignDTO checkCampaign(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.PENDING_CHECKER) {
            throw new RuntimeException("Campaign is not pending checker review");
        }

        campaign.setStatus(Campaign.CampaignStatus.CHECKED);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // CHECKER rejects
    public CampaignDTO rejectByChecker(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.PENDING_CHECKER) {
            throw new RuntimeException("Campaign is not pending checker review");
        }

        campaign.setStatus(Campaign.CampaignStatus.REJECTED);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // ─── APPROVER operations ──────────────────────────────

    // APPROVER gives final approval — triggers RabbitMQ dispatch
    public CampaignDTO approveCampaign(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.CHECKED) {
            throw new RuntimeException("Campaign must be CHECKED before approval");
        }

        if (campaign.getScheduledAt() != null &&
            campaign.getScheduledAt().isAfter(LocalDateTime.now())) {
            campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        } else {
            campaign.setStatus(Campaign.CampaignStatus.APPROVED);
            dispatchToRabbitMQ(campaign);
        }

        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // APPROVER rejects
    public CampaignDTO rejectByApprover(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getStatus() != Campaign.CampaignStatus.CHECKED) {
            throw new RuntimeException("Campaign must be CHECKED before rejection");
        }

        campaign.setStatus(Campaign.CampaignStatus.REJECTED);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // ─── ADMIN operations ─────────────────────────────────

    // ADMIN can approve at any stage — bypass workflow
    public CampaignDTO adminApprove(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getScheduledAt() != null &&
            campaign.getScheduledAt().isAfter(LocalDateTime.now())) {
            campaign.setStatus(Campaign.CampaignStatus.SCHEDULED);
        } else {
            campaign.setStatus(Campaign.CampaignStatus.APPROVED);
            dispatchToRabbitMQ(campaign);
        }

        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // ADMIN can reject at any stage
    public CampaignDTO adminReject(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setStatus(Campaign.CampaignStatus.REJECTED);
        return CampaignDTO.from(campaignRepository.save(campaign));
    }

    // ─── Common ───────────────────────────────────────────

    private void dispatchToRabbitMQ(Campaign campaign) {
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

    public List<CampaignDTO> getCampaignsByStatus(String status) {
        return campaignRepository.findByStatus(
                Campaign.CampaignStatus.valueOf(status))
                .stream()
                .map(CampaignDTO::from)
                .collect(Collectors.toList());
    }

    public CampaignDTO getCampaignById(Long id) {
        return CampaignDTO.from(campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found")));
    }

    public void updateCampaignStatus(Long id, String status) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setStatus(Campaign.CampaignStatus.valueOf(status));
        if (status.equals("SENT")) campaign.setSentAt(LocalDateTime.now());
        campaignRepository.save(campaign);
    }

    public void dispatchScheduledCampaigns() {
        List<Campaign> due = campaignRepository
                .findByStatusAndScheduledAtBefore(
                        Campaign.CampaignStatus.SCHEDULED,
                        LocalDateTime.now()
                );
        for (Campaign campaign : due) {
            campaign.setStatus(Campaign.CampaignStatus.APPROVED);
            campaignRepository.save(campaign);
            dispatchToRabbitMQ(campaign);
        }
    }
}