package com.nic.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Plain Long — no FK to user-service
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type;

    private Long campaignId;

    private boolean isRead = false;

    private boolean emailSent = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}