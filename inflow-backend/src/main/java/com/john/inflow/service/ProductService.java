package com.john.inflow.service;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ProductDetailResponse;
import com.john.inflow.dto.response.ProductResponse;
import com.john.inflow.dto.response.ProductStatsResponse;

public interface ProductService {
    ProductResponse create(CreateProductRequest request);
    ProductResponse getById(Integer id);
    ProductDetailResponse getDetail(Integer id);
    PageResponse<ProductResponse> search(
            String search,
            Integer categoryId,
            Integer supplierId,
            String stockStatus,
            String status,
            int page,
            int size
    );
    ProductResponse update(Integer id, UpdateProductRequest request);
    void deactivate(Integer id);
    void delete(Integer id);
    ProductStatsResponse stats();
}
