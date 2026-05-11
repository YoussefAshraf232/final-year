package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record StockEditRequestResponse(
        Integer id,
        ProductSummaryResponse product,
        WarehouseSummaryResponse warehouse,
        Integer currentQuantity,
        Integer requestedQuantity,
        Integer differenceQuantity,
        String reason,
        String notes,
        String status,
        UserSummaryResponse requestedBy,
        UserSummaryResponse reviewedBy,
        String reviewComment,
        OffsetDateTime createdAt,
        OffsetDateTime reviewedAt,
        OffsetDateTime cancelledAt
) {}
