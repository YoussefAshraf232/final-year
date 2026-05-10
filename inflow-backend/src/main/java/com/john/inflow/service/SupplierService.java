package com.john.inflow.service;

import com.john.inflow.dto.request.SupplierRequest;
import com.john.inflow.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse create(SupplierRequest request);
    SupplierResponse getById(Integer id);
    List<SupplierResponse> getAll();
    SupplierResponse update(Integer id, SupplierRequest request);
    void delete(Integer id);
}
