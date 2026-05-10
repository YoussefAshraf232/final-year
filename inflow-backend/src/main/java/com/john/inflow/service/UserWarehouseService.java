package com.john.inflow.service;

import com.john.inflow.dto.request.AssignUserWarehouseRequest;
import com.john.inflow.dto.response.UserWarehouseResponse;

import java.util.List;

public interface UserWarehouseService {
    UserWarehouseResponse assign(AssignUserWarehouseRequest request);
    List<UserWarehouseResponse> getAll();
}
