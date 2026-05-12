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
        product.setSku(request.sku());
        product.setDescription(request.description());
        product.setPictureUrl(request.pictureUrl());
        product.setCurrentPrice(request.currentPrice());
        product.setCostPrice(request.costPrice());
        product.setReorderLevel(request.reorderLevel() != null ? request.reorderLevel() : 0);
        product.setStatus(request.status() != null ? request.status() : "ACTIVE");
        product.setSupplier(supplier);
        product.setCategories(categories);
        return product;
    }

    public void updateEntity(UpdateProductRequest request, Product product) {
        if (request.name() != null) product.setName(request.name());
        if (request.sku() != null) product.setSku(request.sku());
        if (request.description() != null) product.setDescription(request.description());
        if (request.pictureUrl() != null) product.setPictureUrl(request.pictureUrl());
        if (request.currentPrice() != null) product.setCurrentPrice(request.currentPrice());
        if (request.costPrice() != null) product.setCostPrice(request.costPrice());
        if (request.reorderLevel() != null) product.setReorderLevel(request.reorderLevel());
        if (request.status() != null) product.setStatus(request.status());
    }

    private String stockStatus(long totalStock, Integer reorderLevel) {
        int level = reorderLevel != null ? reorderLevel : 0;
        if (totalStock <= 0) return "OUT_OF_STOCK";
        if (totalStock <= level) return "LOW_STOCK";
        return "IN_STOCK";
    }

    public ProductResponse toResponse(Product product, long totalStock) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getDescription(),
                product.getPictureUrl(),
                product.getCurrentPrice(),
                product.getCostPrice(),
                product.getReorderLevel(),
                product.getStatus(),
                stockStatus(totalStock, product.getReorderLevel()),
                totalStock,
                product.getSupplier() != null ? supplierMapper.toResponse(product.getSupplier(), 0L) : null,
                product.getCategories() != null
                        ? product.getCategories().stream().map(categoryMapper::toResponse).toList()
                        : Collections.emptyList(),
                product.getCreatedAt(),
                product.getUpdatedAt()
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
