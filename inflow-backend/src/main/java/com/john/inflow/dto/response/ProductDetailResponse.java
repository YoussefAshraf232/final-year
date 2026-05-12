package com.john.inflow.dto.response;

import java.util.List;

public record ProductDetailResponse(
    ProductResponse product,
    List<ProductStockByWarehouseResponse> stockByWarehouse
) {}
