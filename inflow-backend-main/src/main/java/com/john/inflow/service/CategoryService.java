package com.john.inflow.service;

import com.john.inflow.dto.request.CategoryRequest;
import com.john.inflow.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse getById(Integer id);
    List<CategoryResponse> getAll();
    CategoryResponse update(Integer id, CategoryRequest request);
    void delete(Integer id);
}
