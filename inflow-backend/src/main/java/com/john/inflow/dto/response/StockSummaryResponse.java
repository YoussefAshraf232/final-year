package com.john.inflow.dto.response;

public record StockSummaryResponse(
    long totalSkus,
    long totalWarehouses,
    long lowStockItems,
    long outOfStockItems
) {}
