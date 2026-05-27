package com.nic.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendNotificationEmail(String to, String subject, String body) {
        try {
            var mimeMessage = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildHtml(body), true);
            mailSender.send(mimeMessage);
            log.info("Notification email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Email send failed: " + e.getMessage());
        }
    }

    private String buildHtml(String body) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;
                        padding:24px;border:1px solid #e5e7eb;border-radius:8px">
                <div style="background:#2563eb;padding:16px;border-radius:6px 6px 0 0">
                    <h2 style="color:white;margin:0">Bulk SMS System</h2>
                </div>
                <div style="padding:24px;background:#f9fafb">
                    <p style="font-size:16px;color:#111827">%s</p>
                </div>
                <div style="padding:12px;text-align:center;color:#6b7280;font-size:12px">
                    This is an automated notification from Bulk SMS System.
                </div>
            </div>
            """.formatted(body);
    }
}