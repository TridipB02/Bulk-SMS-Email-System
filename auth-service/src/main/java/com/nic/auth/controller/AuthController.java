package com.nic.auth.controller;

import com.nic.auth.dto.*;
import com.nic.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody OtpRequest req) {
        authService.sendOtp(req.getEmail());
        return ResponseEntity.ok("OTP sent to " + req.getEmail());
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest req) {
        return ResponseEntity.ok(authService.verifyOtpAndLogin(req));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getMe(email));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(authService.refreshToken(req));
    }
}