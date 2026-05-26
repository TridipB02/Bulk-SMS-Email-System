package com.nic.auth.service;

import com.nic.auth.entity.OtpStore;
import com.nic.auth.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    @Value("${app.otp.expiry}")
    private int otpExpiryMinutes;

    @Transactional
    public void generateAndSendOtp(String email) {
        otpRepository.deleteByEmail(email);

        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpStore otpStore = new OtpStore();
        otpStore.setEmail(email);
        otpStore.setOtp(otp);
        otpStore.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otpRepository.save(otpStore);

        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        var record = otpRepository.findTopByEmailOrderByIdDesc(email)
                .orElse(null);

        if (record == null || record.isUsed()) return false;
        if (record.getExpiresAt().isBefore(LocalDateTime.now())) return false;
        if (!record.getOtp().equals(otp)) return false;

        record.setUsed(true);
        otpRepository.save(record);
        return true;
    }
}