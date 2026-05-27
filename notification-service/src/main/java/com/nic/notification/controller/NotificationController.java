package com.nic.notification.controller;

import com.nic.notification.dto.NotificationDTO;
import com.nic.notification.security.JwtUtil;
import com.nic.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    // Get all my notifications
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    // Get unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnread(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(notificationService.getUnread(userId));
    }

    // Get unread count — useful for frontend badge
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(Map.of("count",
                notificationService.getUnreadCount(userId)));
    }

    // Mark all as read
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }
}