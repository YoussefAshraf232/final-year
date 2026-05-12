package com.john.inflow.controller;

import com.john.inflow.dto.request.AssignUserWarehouseRequest;
import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.ProductWarehouseResponse;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.dto.response.WarehouseResponse;
import com.john.inflow.dto.response.WarehousesSummaryResponse;
import com.john.inflow.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/warehouses")
public class WarehouseController {

    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";
    private static final String CAN_ASSIGN = "hasRole('SYSTEM_ADMIN')";

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<WarehouseResponse> create(@Valid @RequestBody WarehouseRequest request) {
        WarehouseResponse response = warehouseService.create(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<WarehousesSummaryResponse> getSummary() {
        return ResponseEntity.ok(warehouseService.getSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(warehouseService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<WarehouseResponse>> getAll() {
        return ResponseEntity.ok(warehouseService.getAll());
    }

    @PutMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<WarehouseResponse> update(@PathVariable Integer id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.update(id, request));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> deactivate(@PathVariable Integer id) {
        warehouseService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        warehouseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{warehouseId}/products")
    public ResponseEntity<List<ProductWarehouseResponse>> getProducts(@PathVariable Integer warehouseId) {
        return ResponseEntity.ok(warehouseService.getWarehouseProducts(warehouseId));
    }

    @GetMapping("/{warehouseId}/users")
    public ResponseEntity<List<UserResponse>> getUsers(@PathVariable Integer warehouseId) {
        return ResponseEntity.ok(warehouseService.getWarehouseUsers(warehouseId));
    }

    @PostMapping("/{warehouseId}/users")
    @PreAuthorize(CAN_ASSIGN)
    public ResponseEntity<Void> assignUser(@PathVariable Integer warehouseId, @Valid @RequestBody AssignUserWarehouseRequest request) {
        warehouseService.assignUser(warehouseId, request.userId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{warehouseId}/users/{userId}")
    @PreAuthorize(CAN_ASSIGN)
    public ResponseEntity<Void> removeUser(@PathVariable Integer warehouseId, @PathVariable Integer userId) {
        warehouseService.removeUser(warehouseId, userId);
        return ResponseEntity.noContent().build();
    }
}
