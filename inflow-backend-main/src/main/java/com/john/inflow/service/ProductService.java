package com.john.inflow.service;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse create(CreateProductRequest request);
    ProductResponse getById(Integer id);
    List<ProductResponse> getAll();
    ProductResponse update(Integer id, UpdateProductRequest request);
    void delete(Integer id);
}
