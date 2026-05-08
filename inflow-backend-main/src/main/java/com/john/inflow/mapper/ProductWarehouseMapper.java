package com.john.inflow.mapper;

import com.john.inflow.dto.response.ProductWarehouseResponse;
import com.john.inflow.entity.ProductWarehouse;
import org.springframework.stereotype.Component;

@Component
public class ProductWarehouseMapper {

    private final ProductMapper productMapper;
    private final WarehouseMapper warehouseMapper;

    public ProductWarehouseMapper(ProductMapper productMapper, WarehouseMapper warehouseMapper) {
        this.productMapper = productMapper;
        this.warehouseMapper = warehouseMapper;
    }

    public ProductWarehouseResponse toResponse(ProductWarehouse productWarehouse) {
        return new ProductWarehouseResponse(
                productWarehouse.getProduct() != null ? productMapper.toSummary(productWarehouse.getProduct()) : null,
                productWarehouse.getWarehouse() != null ? warehouseMapper.toSummary(productWarehouse.getWarehouse()) : null,
                productWarehouse.getAmount()
        );
    }
}
