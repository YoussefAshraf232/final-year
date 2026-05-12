package com.john.inflow.dto.response;

public record ProductStatsResponse(
    long totalProducts,
    long activeProducts,
    long lowStockProducts,
    long outOfStockProducts
) {}
