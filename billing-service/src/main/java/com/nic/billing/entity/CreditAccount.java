package com.nic.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_accounts")
@Data
public class CreditAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Plain Long — no FK to user-service
    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private Integer credits = 0;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}