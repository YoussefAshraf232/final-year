package com.john.inflow.service;

import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {
    WarehouseResponse create(WarehouseRequest request);
    WarehouseResponse getById(Integer id);
    List<WarehouseResponse> getAll();
    WarehouseResponse update(Integer id, WarehouseRequest request);
    void delete(Integer id);
    
    List<com.john.inflow.dto.response.ProductWarehouseResponse> getWarehouseProducts(Integer warehouseId);
    List<UserResponse> getWarehouseUsers(Integer warehouseId);
    void assignUser(Integer warehouseId, Integer userId);
    void removeUser(Integer warehouseId, Integer userId);
}
