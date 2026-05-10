package com.john.inflow.service;

import com.john.inflow.dto.response.AuditLogResponse;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.entity.AuditLog;
import com.john.inflow.entity.User;
import com.john.inflow.repository.AuditLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAll(String entityType, String action, Integer actorUserId, OffsetDateTime dateFrom, OffsetDateTime dateTo, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.of(auditLogRepository.search(entityType, action, actorUserId, dateFrom, dateTo, pageable).map(this::toResponse));
    }

    @Transactional
    public void log(User actor, String action, String entityType, Object entityId, String metadata) {
        AuditLog auditLog = AuditLog.builder()
                .actorUser(actor)
                .actorUsername(actor != null ? actor.getUsername() : null)
                .action(action)
                .entityType(entityType)
                .entityId(entityId != null ? String.valueOf(entityId) : null)
                .metadata(metadata)
                .build();
        auditLogRepository.save(auditLog);
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        User actor = auditLog.getActorUser();
        return new AuditLogResponse(
                auditLog.getId(),
                actor != null ? actor.getId() : null,
                auditLog.getActorUsername(),
                auditLog.getAction(),
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getRequestPath(),
                auditLog.getHttpMethod(),
                auditLog.getIp(),
                auditLog.getUserAgent(),
                auditLog.getCreatedAt(),
                auditLog.getMetadata()
        );
    }
}
