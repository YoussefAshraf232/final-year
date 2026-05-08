package com.john.inflow.service;

import com.john.inflow.dto.request.RoleRequest;
import com.john.inflow.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse create(RoleRequest request);
    RoleResponse getById(Integer id);
    List<RoleResponse> getAll();
    RoleResponse update(Integer id, RoleRequest request);
    void delete(Integer id);
}
