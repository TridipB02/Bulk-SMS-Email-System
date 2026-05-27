package com.nic.billing.controller;

import com.nic.billing.dto.*;
import com.nic.billing.security.JwtUtil;
import com.nic.billing.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final JwtUtil jwtUtil;

    // Get my credit balance
    @GetMapping("/balance")
    public ResponseEntity<CreditAccountDTO> getMyBalance(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(billingService.getOrCreateAccount(userId));
    }

    // Get my transaction history
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDTO>> getMyTransactions(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(billingService.getMyTransactions(userId));
    }

    // Admin — top up credits for a user
    @PostMapping("/topup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreditAccountDTO> topUp(
            @Valid @RequestBody TopUpRequest req) {
        return ResponseEntity.ok(billingService.topUp(req));
    }

    // Admin — get all transactions
    @GetMapping("/transactions/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(billingService.getAllTransactions());
    }
}