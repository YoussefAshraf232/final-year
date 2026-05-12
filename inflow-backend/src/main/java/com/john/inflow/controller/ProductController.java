package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateProductRequest;
import com.john.inflow.dto.request.UpdateProductRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ProductDetailResponse;
import com.john.inflow.dto.response.ProductResponse;
import com.john.inflow.dto.response.ProductStatsResponse;
import com.john.inflow.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/products")
public class ProductController {

    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.create(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<ProductStatsResponse> stats() {
        return ResponseEntity.ok(productService.stats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<ProductDetailResponse> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getDetail(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer supplierId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(productService.search(search, categoryId, supplierId, stockStatus, status, page, size));
    }

    @PutMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ProductResponse> update(@PathVariable Integer id, @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> deactivate(@PathVariable Integer id) {
        productService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
