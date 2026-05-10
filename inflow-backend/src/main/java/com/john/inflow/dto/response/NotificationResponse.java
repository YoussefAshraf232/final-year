package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record NotificationResponse(
        Integer id,
        Integer userId,
        String type,
        String title,
        String body,
        String relatedEntityType,
        Integer relatedEntityId,
        OffsetDateTime readAt,
        OffsetDateTime createdAt
) {}
