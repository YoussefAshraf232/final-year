package com.john.inflow.dto.response;

public record StockOnHandResponse(
    Integer productId,
    String productName,
    Integer warehouseId,
    String warehouseName,
    Integer amount
) {}
