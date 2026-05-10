package com.john.inflow.service;

import com.john.inflow.dto.response.NotificationResponse;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.entity.Notification;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.User;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.repository.NotificationRepository;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class NotificationService {
    private static final int LOW_STOCK_THRESHOLD = 10;
    private final NotificationRepository notificationRepository;
    private final ProductWarehouseRepository productWarehouseRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, ProductWarehouseRepository productWarehouseRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.productWarehouseRepository = productWarehouseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getForUser(Integer userId, boolean unreadOnly, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.of(notificationRepository.findForUser(userId, unreadOnly, pageable).map(this::toResponse));
    }

    @Transactional
    public void markRead(Integer userId, Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification", id);
        }
        notification.setReadAt(OffsetDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Integer userId) {
        notificationRepository.findForUser(userId, true, Pageable.unpaged())
                .forEach(notification -> notification.setReadAt(OffsetDateTime.now()));
    }

    @Scheduled(fixedDelayString = "${inflow.notifications.low-stock-delay-ms:300000}")
    @Transactional
    public void createLowStockNotifications() {
        List<User> recipients = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && (
                        "SYSTEM_ADMIN".equals(user.getRole().getName()) ||
                        "OPERATIONAL_MANAGER".equals(user.getRole().getName()) ||
                        "WAREHOUSE_MANAGER".equals(user.getRole().getName())
                ))
                .toList();
        if (recipients.isEmpty()) {
            return;
        }
        for (ProductWarehouse stock : productWarehouseRepository.findLowStock(LOW_STOCK_THRESHOLD)) {
            Integer relatedId = stock.getProduct().getId();
            for (User user : recipients) {
                boolean exists = notificationRepository.existsByUserIdAndTypeAndRelatedEntityTypeAndRelatedEntityIdAndReadAtIsNull(
                        user.getId(), "LOW_STOCK", "PRODUCT", relatedId);
                if (!exists) {
                    notificationRepository.save(Notification.builder()
                            .user(user)
                            .type("LOW_STOCK")
                            .title("Low stock")
                            .body(stock.getProduct().getName() + " is low in " + stock.getWarehouse().getAddress())
                            .relatedEntityType("PRODUCT")
                            .relatedEntityId(relatedId)
                            .build());
                }
            }
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getUser().getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
