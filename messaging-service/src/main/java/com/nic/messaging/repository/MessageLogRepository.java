package com.nic.messaging.repository;

import com.nic.messaging.entity.MessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageLogRepository extends JpaRepository<MessageLog, Long> {
    List<MessageLog> findByCampaignId(Long campaignId);
    List<MessageLog> findByCreatedBy(Long userId);
    long countByCampaignIdAndStatus(Long campaignId, MessageLog.MessageStatus status);
}