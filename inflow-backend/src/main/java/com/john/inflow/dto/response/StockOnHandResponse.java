package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record StockOnHandResponse(
    Integer productId,
    String productName,
    String sku,
    Integer warehouseId,
    String warehouseName,
    Integer quantityOnHand,
    Integer reservedQuantity,
    Integer availableQuantity,
    Integer reorderLevel,
    BigDecimal unitValue,
    BigDecimal totalValue,
    OffsetDateTime lastMovementAt,
    OffsetDateTime updatedAt,
    String status
) {}
