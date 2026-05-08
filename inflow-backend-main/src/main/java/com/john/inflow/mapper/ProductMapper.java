package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.ProductResponse;
import com.john.inflow.dto.response.ProductSummaryResponse;
import com.john.inflow.entity.Category;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.Supplier;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;

@Component
public class ProductMapper {

    private final SupplierMapper supplierMapper;
    private final CategoryMapper categoryMapper;

    public ProductMapper(SupplierMapper supplierMapper, CategoryMapper categoryMapper) {
        this.supplierMapper = supplierMapper;
        this.categoryMapper = categoryMapper;
    }

    public Product toEntity(CreateProductRequest request, Supplier supplier, Set<Category> categories) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPictureUrl(request.pictureUrl());
        product.setCurrentPrice(request.currentPrice());
        product.setSupplier(supplier);
        product.setCategories(categories);
        return product;
    }

    public void updateEntity(UpdateProductRequest request, Product product) {
        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.pictureUrl() != null) {
            product.setPictureUrl(request.pictureUrl());
        }
        if (request.currentPrice() != null) {
            product.setCurrentPrice(request.currentPrice());
        }
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPictureUrl(),
                product.getCurrentPrice(),
                product.getSupplier() != null ? supplierMapper.toResponse(product.getSupplier()) : null,
                product.getCategories() != null ? product.getCategories().stream().map(categoryMapper::toResponse).toList() : Collections.emptyList()
        );
    }

    public ProductSummaryResponse toSummary(Product product) {
        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getCurrentPrice()
        );
    }
}
