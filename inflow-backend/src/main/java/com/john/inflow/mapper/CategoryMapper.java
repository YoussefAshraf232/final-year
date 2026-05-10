package com.john.inflow.mapper;

import com.john.inflow.dto.request.CategoryRequest;
import com.john.inflow.dto.response.CategoryResponse;
import com.john.inflow.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        return category;
    }

    public void updateEntity(CategoryRequest request, Category category) {
        category.setName(request.name());
    }

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
