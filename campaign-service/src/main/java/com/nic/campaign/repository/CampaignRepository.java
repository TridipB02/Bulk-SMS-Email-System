package com.nic.campaign.repository;

import com.nic.campaign.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByCreatedBy(Long userId);
    List<Campaign> findByStatus(Campaign.CampaignStatus status);
    List<Campaign> findByStatusAndScheduledAtBefore(
            Campaign.CampaignStatus status, LocalDateTime time);
}