package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record CustomerDetailResponse(
    Integer id,
    String customerId,
    String name,
    String phone,
    String email,
    String address,
    String status,
    String notes,
    BigDecimal totalSales,
    BigDecimal totalReturns,
    long returnsCount,
    OffsetDateTime lastSale,
    OffsetDateTime lastReturn,
    OffsetDateTime createdAt,
    OffsetDateTime deactivatedAt,
    List<CustomerActivityResponse> recentSales,
    List<CustomerActivityResponse> recentReturns
) {}
