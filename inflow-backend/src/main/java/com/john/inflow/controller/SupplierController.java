package com.john.inflow.controller;

import com.john.inflow.dto.request.SupplierRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SupplierDetailResponse;
import com.john.inflow.dto.response.SupplierResponse;
import com.john.inflow.dto.response.SupplierStatsResponse;
import com.john.inflow.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/suppliers")
public class SupplierController {

    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.create(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<SupplierStatsResponse> stats() {
        return ResponseEntity.ok(supplierService.stats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<SupplierDetailResponse> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(supplierService.getDetail(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<SupplierResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String hasProducts,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(supplierService.search(search, status, hasProducts, page, size));
    }

    @PutMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<SupplierResponse> update(@PathVariable Integer id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.update(id, request));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> deactivate(@PathVariable Integer id) {
        supplierService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
