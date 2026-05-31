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

    @RabbitListener(queues = RabbitMQConfig.CAMPAIGN_QUEUE)
    public void handleCampaignDispatch(CampaignDispatchEvent event) {
        log.info("Received campaign dispatch event: campaignId={}", event.getCampaignId());

        try {
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
                MessageLog messageLog = new MessageLog();
                messageLog.setCampaignId(event.getCampaignId());
                messageLog.setGroupId(event.getGroupId());
                messageLog.setCreatedBy(event.getCreatedBy());
                messageLog.setRecipient(recipient);
                messageLog.setMessage(event.getMessage());
                messageLog.setType(MessageLog.MessageType.valueOf(event.getType()));

                try {
                    sendMessage(messageLog, event.getType());
                    messageLog.setStatus(MessageLog.MessageStatus.SENT);
                    messageLog.setSentAt(LocalDateTime.now());
                    sent++;
                } catch (Exception e) {
                    messageLog.setStatus(MessageLog.MessageStatus.FAILED);
                    messageLog.setFailureReason(e.getMessage());
                    messageLog.setRetryCount(0);
                    messageLog.setMaxRetries(3);
                    messageLog.setNextRetryAt(LocalDateTime.now().plusMinutes(2));
                    failed++;
                }

                messageLogRepository.save(messageLog);
            }

            String finalStatus = failed == 0 ? "SENT" : (sent == 0 ? "FAILED" : "SENT");
            campaignServiceClient.updateCampaignStatus(event.getCampaignId(), finalStatus);

            publishNotificationEvent(event.getCreatedBy(), event.getCampaignId(), sent, failed);
            publishBillingEvent(event.getCreatedBy(), sent);

            log.info("Campaign {} processed. Sent={}, Failed={}",
                    event.getCampaignId(), sent, failed);

        } catch (Exception e) {
            log.error("Failed to process campaign {}: {}",
                    event.getCampaignId(), e.getMessage());
            campaignServiceClient.updateCampaignStatus(event.getCampaignId(), "FAILED");
        }
    }

    private void sendMessage(MessageLog messageLog, String type) {
        if (type.equals("EMAIL")) {
            emailService.sendEmail(messageLog.getRecipient(), messageLog.getMessage());
        } else {
            simulateSms(messageLog.getRecipient(), messageLog.getMessage());
        }
    }

    private void simulateSms(String phoneNumber, String message) {
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
        return Map.of("sent", sent, "failed", failed, "total", sent + failed);
    }
}