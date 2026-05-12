package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record ProductResponse(
    Integer id,
    String name,
    String sku,
    String description,
    String pictureUrl,
    BigDecimal currentPrice,
    BigDecimal costPrice,
    Integer reorderLevel,
    String status,
    String stockStatus,
    long totalStock,
    SupplierResponse supplier,
    List<CategoryResponse> categories,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
