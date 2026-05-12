package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CustomerResponse(
    Integer id,
    String customerId,
    String name,
    String phone,
    String email,
    String address,
    String status,
    String notes,
    BigDecimal totalSales,
    long returnsCount,
    OffsetDateTime createdAt,
    OffsetDateTime deactivatedAt
) {}
