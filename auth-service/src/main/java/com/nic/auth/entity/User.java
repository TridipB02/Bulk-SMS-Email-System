package com.nic.auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MAKER;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        ADMIN, MAKER, CHECKER, APPROVER
    }
}