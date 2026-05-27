package com.nic.messaging.service;

import com.nic.messaging.client.CampaignServiceClient;
import com.nic.messaging.client.ContactServiceClient;
import com.nic.messaging.config.RabbitMQConfig;
import com.nic.messaging.dto.CampaignDispatchEvent;
import com.nic.messaging.dto.MessageLogDTO;
import com.nic.messaging.entity.MessageLog;
import com.nic.messaging.repository.MessageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final MessageLogRepository messageLogRepository;
    private final ContactServiceClient contactServiceClient;
    private final CampaignServiceClient campaignServiceClient;
    private final EmailService emailService;
    private final RabbitTemplate rabbitTemplate;

    // ─── RabbitMQ Consumer ────────────────────────────────

    @RabbitListener(queues = RabbitMQConfig.CAMPAIGN_QUEUE)
    public void handleCampaignDispatch(CampaignDispatchEvent event) {
        log.info("Received campaign dispatch event: campaignId={}", event.getCampaignId());

        try {

            // Fetch recipients based on message type
            List<String> recipients = event.getType().equals("EMAIL")
                    ? contactServiceClient.getEmails(event.getGroupId())
                    : contactServiceClient.getPhoneNumbers(event.getGroupId());

            if (recipients.isEmpty()) {
                log.warn("No recipients found for groupId={}", event.getGroupId());
                campaignServiceClient.updateCampaignStatus(event.getCampaignId(), "FAILED");
                return;
            }

            int sent = 0, failed = 0;

            for (String recipient : recipients) {
                MessageLog log = new MessageLog();
                log.setCampaignId(event.getCampaignId());
                log.setGroupId(event.getGroupId());
                log.setCreatedBy(event.getCreatedBy());
                log.setRecipient(recipient);
                log.setMessage(event.getMessage());
                log.setType(MessageLog.MessageType.valueOf(event.getType()));

                try {
                    if (event.getType().equals("EMAIL")) {
                        emailService.sendEmail(recipient, event.getMessage());
                    } else {
                        // SMS — log only for now (real SMS gateway integration goes here)
                        simulateSms(recipient, event.getMessage());
                    }

                    log.setStatus(MessageLog.MessageStatus.SENT);
                    log.setSentAt(LocalDateTime.now());
                    sent++;

                } catch (Exception e) {
                    log.setStatus(MessageLog.MessageStatus.FAILED);
                    log.setFailureReason(e.getMessage());
                    failed++;
                }

                messageLogRepository.save(log);
            }

            // Update campaign status
            String finalStatus = failed == 0 ? "SENT" : (sent == 0 ? "FAILED" : "SENT");
            campaignServiceClient.updateCampaignStatus(event.getCampaignId(), finalStatus);

            // Publish notification event
            publishNotificationEvent(event.getCreatedBy(), event.getCampaignId(), sent, failed);

            // Publish billing deduction event
            publishBillingEvent(event.getCreatedBy(), sent);

            this.log.info("Campaign {} processed. Sent={}, Failed={}",
                    event.getCampaignId(), sent, failed);

        } catch (Exception e) {
            this.log.error("Failed to process campaign {}: {}",
                    event.getCampaignId(), e.getMessage());

            campaignServiceClient.updateCampaignStatus(event.getCampaignId(), "FAILED");
        }
    }

    private void simulateSms(String phoneNumber, String message) {
        // Placeholder — replace with real SMS gateway (Twilio, AWS SNS, etc.)
        log.info("SMS sent to {}: {}", phoneNumber, message);
    }

    private void publishNotificationEvent(Long userId, Long campaignId, int sent, int failed) {
        Map<String, Object> event = Map.of(
                "userId", userId,
                "campaignId", campaignId,
                "message", "Campaign completed. Sent: " + sent + ", Failed: " + failed,
                "type", "CAMPAIGN_COMPLETED"
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                event
        );
    }

    private void publishBillingEvent(Long userId, int sentCount) {
        Map<String, Object> event = Map.of(
                "userId", userId,
                "amount", sentCount,
                "description", "SMS campaign - " + sentCount + " messages sent"
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.BILLING_EXCHANGE,
                RabbitMQConfig.BILLING_ROUTING_KEY,
                event
        );
    }

    // ─── REST endpoints ───────────────────────────────────

    public List<MessageLogDTO> getLogsByCampaign(Long campaignId) {
        return messageLogRepository.findByCampaignId(campaignId)
                .stream()
                .map(MessageLogDTO::from)
                .collect(Collectors.toList());
    }

    public List<MessageLogDTO> getMyLogs(Long userId) {
        return messageLogRepository.findByCreatedBy(userId)
                .stream()
                .map(MessageLogDTO::from)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getCampaignStats(Long campaignId) {
        long sent = messageLogRepository.countByCampaignIdAndStatus(
                campaignId, MessageLog.MessageStatus.SENT);

        long failed = messageLogRepository.countByCampaignIdAndStatus(
                campaignId, MessageLog.MessageStatus.FAILED);

        return Map.of(
                "sent", sent,
                "failed", failed,
                "total", sent + failed
        );
    }
}