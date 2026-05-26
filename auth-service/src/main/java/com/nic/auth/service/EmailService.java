package com.nic.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Your OTP - Bulk SMS System");
            helper.setText(buildOtpHtml(otp), true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    private String buildOtpHtml(String otp) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px">
                <h2 style="color:#2563eb">Bulk SMS System</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <div style="font-size:36px;font-weight:bold;color:#1d4ed8;letter-spacing:8px;
                            padding:16px;background:#eff6ff;border-radius:8px;text-align:center">
                    %s
                </div>
                <p style="color:#6b7280;margin-top:16px">This OTP expires in 5 minutes.</p>
            </div>
            """.formatted(otp);
    }
}