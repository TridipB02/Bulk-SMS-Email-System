package com.nic.messaging.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_logs")
@Data
public class MessageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Plain Longs — no FK to other services
    private Long campaignId;
    private Long groupId;
    private Long createdBy;

    @Column(nullable = false)
    private String recipient;   // phone number or email

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private String failureReason;

    private LocalDateTime sentAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum MessageType {
        SMS, EMAIL
    }

    public enum MessageStatus {
        PENDING, SENT, FAILED
    }
}