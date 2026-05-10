package com.john.inflow.controller;

import com.john.inflow.dto.response.ProductWarehouseResponse;
import com.john.inflow.service.ProductWarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-warehouses")
public class ProductWarehouseController {

    private final ProductWarehouseService productWarehouseService;

    public ProductWarehouseController(ProductWarehouseService productWarehouseService) {
        this.productWarehouseService = productWarehouseService;
    }

    @GetMapping
    public ResponseEntity<List<ProductWarehouseResponse>> getAll() {
        return ResponseEntity.ok(productWarehouseService.getAll());
    }

    @GetMapping("/{productId}/{warehouseId}")
    public ResponseEntity<ProductWarehouseResponse> getByProductAndWarehouse(
            @PathVariable Integer productId, 
            @PathVariable Integer warehouseId) {
        return ResponseEntity.ok(productWarehouseService.getByProductAndWarehouse(productId, warehouseId));
    }
}
