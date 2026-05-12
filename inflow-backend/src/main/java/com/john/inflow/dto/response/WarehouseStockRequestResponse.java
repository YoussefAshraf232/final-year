package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record WarehouseStockRequestResponse(
        Integer id,
        ProductSummaryResponse product,
        WarehouseSummaryResponse sourceWarehouse,
        WarehouseSummaryResponse destinationWarehouse,
        Integer requestedQuantity,
        Integer approvedQuantity,
        Integer availableQuantity,
        String status,
        String reason,
        String notes,
        UserSummaryResponse requestedBy,
        UserSummaryResponse reviewedBy,
        String reviewerComment,
        OffsetDateTime createdAt,
        OffsetDateTime reviewedAt,
        OffsetDateTime completedAt,
        OffsetDateTime cancelledAt
) {}
