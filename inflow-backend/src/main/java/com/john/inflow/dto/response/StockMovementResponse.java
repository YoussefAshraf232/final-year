package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record StockMovementResponse(
        Integer id,
        Integer productId,
        String productName,
        Integer warehouseId,
        String warehouseName,
        String movementType,
        Integer quantity,
        BigDecimal unitCost,
        BigDecimal totalValue,
        String referenceType,
        Integer referenceId,
        String note,
        Integer actorUserId,
        String actorUsername,
        OffsetDateTime createdAt
) {}
