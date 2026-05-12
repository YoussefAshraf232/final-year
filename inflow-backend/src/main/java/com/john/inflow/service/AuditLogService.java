package com.john.inflow.service;

import com.john.inflow.dto.response.AuditLogResponse;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.entity.AuditLog;
import com.john.inflow.entity.User;
import com.john.inflow.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAll(String entityType, String action, Integer actorUserId, OffsetDateTime dateFrom, OffsetDateTime dateTo, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String trimmed = (search == null || search.isBlank()) ? null : search.trim();
        Specification<AuditLog> specification = buildSpecification(entityType, action, actorUserId, dateFrom, dateTo, trimmed);
        return PageResponse.of(auditLogRepository.findAll(specification, pageable).map(this::toResponse));
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

    private Specification<AuditLog> buildSpecification(
            String entityType,
            String action,
            Integer actorUserId,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (entityType != null && !entityType.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("entityType"), entityType));
            }
            if (action != null && !action.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("action"), action));
            }
            if (actorUserId != null) {
                predicates.add(criteriaBuilder.equal(root.get("actorUser").get("id"), actorUserId));
            }
            if (dateFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), dateTo));
            }
            if (search != null) {
                String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("actorUsername"), "")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("action")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("entityType")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("entityId"), "")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("requestPath"), "")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("metadata"), "")), pattern)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
