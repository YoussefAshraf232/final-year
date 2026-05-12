package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record SupplierResponse(
    Integer id,
    String name,
    String phone,
    String address,
    String email,
    String contactPerson,
    String status,
    String notes,
    long productsCount,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
