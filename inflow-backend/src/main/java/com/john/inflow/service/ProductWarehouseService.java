package com.john.inflow.service;

import com.john.inflow.dto.response.ProductWarehouseResponse;

import java.util.List;

public interface ProductWarehouseService {
    List<ProductWarehouseResponse> getAll();
    ProductWarehouseResponse getByProductAndWarehouse(Integer productId, Integer warehouseId);
}
