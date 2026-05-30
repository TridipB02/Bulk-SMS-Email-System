package com.nic.auth.service;

import com.nic.auth.dto.*;
import com.nic.auth.entity.User;
import com.nic.auth.repository.UserRepository;
import com.nic.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final UserServiceClient userServiceClient;

    public String register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);

        userServiceClient.createUserProfile(req.getName(), req.getEmail(), user.getRole().name());

        otpService.generateAndSendOtp(req.getEmail());
        return "Registered successfully. OTP sent to " + req.getEmail();
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        // Save refresh token to DB
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
                LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken,
                user.getEmail(), user.getRole().name());
    }

    public void sendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("No user found with this email");
        }
        otpService.generateAndSendOtp(email);
    }

    public AuthResponse verifyOtpAndLogin(OtpVerifyRequest req) {
        boolean valid = otpService.verifyOtp(req.getEmail(), req.getOtp());
        if (!valid) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken,
                user.getEmail(), user.getRole().name());
    }

    public AuthResponse refreshToken(RefreshTokenRequest req) {
        String token = req.getRefreshToken();

        // Validate it is a refresh token
        if (!jwtUtil.isTokenValid(token) || !jwtUtil.isRefreshToken(token)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check it matches what we stored
        if (!token.equals(user.getRefreshToken())) {
            throw new RuntimeException("Refresh token mismatch");
        }

        // Check expiry
        if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired — please login again");
        }

        // Issue new access token
        String newAccessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(newAccessToken, token,
                user.getEmail(), user.getRole().name());
    }

    public User getMe(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}