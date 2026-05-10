package com.john.inflow.service;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ProductResponse;

public interface ProductService {
    ProductResponse create(CreateProductRequest request);
    ProductResponse getById(Integer id);
    PageResponse<ProductResponse> getAll(int page, int size);
    ProductResponse update(Integer id, UpdateProductRequest request);
    void delete(Integer id);
}
