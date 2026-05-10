package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record AuditLogResponse(
        Integer id,
        Integer actorUserId,
        String actorUsername,
        String action,
        String entityType,
        String entityId,
        String requestPath,
        String httpMethod,
        String ip,
        String userAgent,
        OffsetDateTime createdAt,
        String metadata
) {}
