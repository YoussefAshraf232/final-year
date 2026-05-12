package com.john.inflow.service;

import com.john.inflow.dto.request.SupplierRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SupplierDetailResponse;
import com.john.inflow.dto.response.SupplierResponse;
import com.john.inflow.dto.response.SupplierStatsResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse create(SupplierRequest request);
    SupplierResponse getById(Integer id);
    SupplierDetailResponse getDetail(Integer id);
    List<SupplierResponse> getAll();
    PageResponse<SupplierResponse> search(String search, String status, String hasProducts, int page, int size);
    SupplierResponse update(Integer id, SupplierRequest request);
    void deactivate(Integer id);
    void delete(Integer id);
    SupplierStatsResponse stats();
}
