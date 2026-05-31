package com.nic.messaging.repository;

import com.nic.messaging.entity.MessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface MessageLogRepository extends JpaRepository<MessageLog, Long> {
    List<MessageLog> findByCampaignId(Long campaignId);
    List<MessageLog> findByCreatedBy(Long userId);
    long countByCampaignIdAndStatus(Long campaignId, MessageLog.MessageStatus status);
    List<MessageLog> findByStatusAndNextRetryAtBeforeAndRetryCountLessThan(
            MessageLog.MessageStatus status,
            LocalDateTime time,
            int maxRetries
    );
}