package com.nic.campaign.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
@Data
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    // Plain Long — no FK to user-service
    @Column(nullable = false)
    private Long createdBy;

    // Plain Long — no FK to contact-service
    @Column(nullable = false)
    private Long groupId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status = CampaignStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignType type = CampaignType.SMS;

    private LocalDateTime scheduledAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime sentAt;

    @Column(nullable = false)
    private String timezone = "Asia/Kolkata";

    public enum CampaignStatus {
        DRAFT,
        PENDING_CHECKER,
        CHECKED,
        PENDING_APPROVAL,
        APPROVED,
        REJECTED,
        SENDING,
        SENT,
        FAILED,
        SCHEDULED
    }

    public enum CampaignType {
        SMS, EMAIL
    }
}