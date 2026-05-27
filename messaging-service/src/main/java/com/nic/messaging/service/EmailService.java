package com.nic.messaging.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, String message) {
        try {
            var mimeMessage = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject("Message from Bulk SMS System");
            helper.setText(message, false);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Email send failed: " + e.getMessage());
        }
    }
}