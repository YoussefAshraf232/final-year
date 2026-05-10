package com.john.inflow.dto.response;

public record ProductWarehouseResponse(
    ProductSummaryResponse product,
    WarehouseSummaryResponse warehouse,
    Integer amount
) {}
