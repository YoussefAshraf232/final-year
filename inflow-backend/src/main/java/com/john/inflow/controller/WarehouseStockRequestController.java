package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateWarehouseStockRequest;
import com.john.inflow.dto.request.ReviewWarehouseStockRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.WarehouseStockRequestResponse;
import com.john.inflow.dto.response.WarehouseStockRequestSummaryResponse;
import com.john.inflow.entity.User;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.WarehouseStockRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/warehouse-stock-requests")
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')")
public class WarehouseStockRequestController {
    private final WarehouseStockRequestService service;
    private final AuthService authService;

    public WarehouseStockRequestController(WarehouseStockRequestService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<WarehouseStockRequestResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateWarehouseStockRequest request
    ) {
        User actor = authService.getCurrentUser(authentication);
        WarehouseStockRequestResponse response = service.create(request, actor);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/outgoing")
    public ResponseEntity<PageResponse<WarehouseStockRequestResponse>> outgoing(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.outgoing(authService.getCurrentUser(authentication), status, page, size));
    }

    @GetMapping("/incoming")
    public ResponseEntity<PageResponse<WarehouseStockRequestResponse>> incoming(
            Authentication authentication,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.incoming(authService.getCurrentUser(authentication), status, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<WarehouseStockRequestSummaryResponse> summary(Authentication authentication) {
        return ResponseEntity.ok(service.summary(authService.getCurrentUser(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseStockRequestResponse> getById(Authentication authentication, @PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id, authService.getCurrentUser(authentication)));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<WarehouseStockRequestResponse> accept(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody(required = false) ReviewWarehouseStockRequest request
    ) {
        return ResponseEntity.ok(service.accept(id, request, authService.getCurrentUser(authentication)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<WarehouseStockRequestResponse> reject(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody(required = false) ReviewWarehouseStockRequest request
    ) {
        return ResponseEntity.ok(service.reject(id, request, authService.getCurrentUser(authentication)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<WarehouseStockRequestResponse> cancel(Authentication authentication, @PathVariable Integer id) {
        return ResponseEntity.ok(service.cancel(id, authService.getCurrentUser(authentication)));
    }
}
