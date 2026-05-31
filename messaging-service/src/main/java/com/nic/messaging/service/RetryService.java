package com.nic.messaging.service;

import com.nic.messaging.entity.MessageLog;
import com.nic.messaging.repository.MessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RetryService {

    private final MessageLogRepository messageLogRepository;
    private final EmailService emailService;

    // Runs every 2 minutes
    @Scheduled(fixedRate = 120000)
    public void retryFailedMessages() {
        List<MessageLog> failedMessages = messageLogRepository
                .findByStatusAndNextRetryAtBeforeAndRetryCountLessThan(
                        MessageLog.MessageStatus.FAILED,
                        LocalDateTime.now(),
                        3
                );

        if (failedMessages.isEmpty()) return;

        log.info("Retrying {} failed messages", failedMessages.size());

        for (MessageLog message : failedMessages) {
            try {
                log.info("Retrying message id={} attempt={} recipient={}",
                        message.getId(),
                        message.getRetryCount() + 1,
                        message.getRecipient());

                if (message.getType() == MessageLog.MessageType.EMAIL) {
                    emailService.sendEmail(
                            message.getRecipient(),
                            message.getMessage());
                } else {
                    // SMS simulation
                    log.info("SMS retry to {}: {}",
                            message.getRecipient(),
                            message.getMessage());
                }

                // Success
                message.setStatus(MessageLog.MessageStatus.SENT);
                message.setSentAt(LocalDateTime.now());
                message.setFailureReason(null);
                log.info("Retry successful for message id={}", message.getId());

            } catch (Exception e) {
                // Failed again
                message.setRetryCount(message.getRetryCount() + 1);
                message.setFailureReason(e.getMessage());

                if (message.getRetryCount() >= message.getMaxRetries()) {
                    // Max retries reached — give up
                    log.error("Max retries reached for message id={}. Giving up.",
                            message.getId());
                    message.setNextRetryAt(null);
                } else {
                    // Schedule next retry with exponential backoff
                    // Attempt 1 → 2 min, Attempt 2 → 4 min, Attempt 3 → 8 min
                    long delayMinutes = (long) Math.pow(2, message.getRetryCount() + 1);
                    message.setNextRetryAt(
                            LocalDateTime.now().plusMinutes(delayMinutes));
                    log.warn("Retry {} failed for message id={}. Next retry in {} minutes",
                            message.getRetryCount(),
                            message.getId(),
                            delayMinutes);
                }
            }
            messageLogRepository.save(message);
        }
    }
}