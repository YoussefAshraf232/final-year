package com.john.inflow.controller;

import com.john.inflow.dto.response.NotificationResponse;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getAll(
            Authentication authentication,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(notificationService.getForUser(userId, unreadOnly, page, size));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication authentication, @PathVariable Integer id) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        notificationService.markRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }
}
