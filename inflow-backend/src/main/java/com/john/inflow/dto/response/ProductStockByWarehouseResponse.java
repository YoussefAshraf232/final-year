package com.john.inflow.dto.response;

public record ProductStockByWarehouseResponse(
    Integer warehouseId,
    String warehouseName,
    long amount,
    String stockStatus
) {}
