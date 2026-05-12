package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record WarehouseResponse(
    Integer id,
    String address,
    Boolean isCentral,
    String status,
    String phone,
    String notes,
    UserSummaryResponse manager,
    Integer productsCount,
    Integer totalStock,
    Integer lowStockItems,
    OffsetDateTime createdAt,
    OffsetDateTime deactivatedAt
) {}
