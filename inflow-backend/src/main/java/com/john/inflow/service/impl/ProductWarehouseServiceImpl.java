package com.john.inflow.service.impl;

import com.john.inflow.dto.response.ProductWarehouseResponse;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.mapper.ProductWarehouseMapper;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.service.ProductWarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductWarehouseServiceImpl implements ProductWarehouseService {

    private final ProductWarehouseRepository productWarehouseRepository;
    private final ProductWarehouseMapper productWarehouseMapper;

    public ProductWarehouseServiceImpl(ProductWarehouseRepository productWarehouseRepository, ProductWarehouseMapper productWarehouseMapper) {
        this.productWarehouseRepository = productWarehouseRepository;
        this.productWarehouseMapper = productWarehouseMapper;
    }

    @Override
    public List<ProductWarehouseResponse> getAll() {
        return productWarehouseRepository.findAll().stream()
                .map(productWarehouseMapper::toResponse)
                .toList();
    }

    @Override
    public ProductWarehouseResponse getByProductAndWarehouse(Integer productId, Integer warehouseId) {
        ProductWarehouseId id = new ProductWarehouseId(productId, warehouseId);
        ProductWarehouse pw = productWarehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ProductWarehouse",
                        String.format("product=%d, warehouse=%d", productId, warehouseId)));
        return productWarehouseMapper.toResponse(pw);
    }
}
