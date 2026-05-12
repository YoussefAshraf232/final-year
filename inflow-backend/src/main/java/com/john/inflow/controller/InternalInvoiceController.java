package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateInternalInvoiceRequest;
import com.john.inflow.dto.response.InternalInvoiceResponse;
import com.john.inflow.entity.User;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.InternalInvoiceService;
import com.john.inflow.service.WarehouseAccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/internal-invoices")
public class InternalInvoiceController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_DELETE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final InternalInvoiceService internalInvoiceService;
    private final AuthService authService;
    private final WarehouseAccessService warehouseAccessService;

    public InternalInvoiceController(
            InternalInvoiceService internalInvoiceService,
            AuthService authService,
            WarehouseAccessService warehouseAccessService
    ) {
        this.internalInvoiceService = internalInvoiceService;
        this.authService = authService;
        this.warehouseAccessService = warehouseAccessService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<InternalInvoiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateInternalInvoiceRequest request
    ) {
        User actor = authService.getCurrentUser(authentication);
        warehouseAccessService.assertCanManageWarehouse(actor, request.sourceWarehouseId());
        Integer effectiveUserId = actor.getId();
        InternalInvoiceResponse response = internalInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<com.john.inflow.dto.response.TransfersSummaryResponse> getSummary() {
        return ResponseEntity.ok(internalInvoiceService.getSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternalInvoiceResponse> getById(Authentication authentication, @PathVariable Integer id) {
        InternalInvoiceResponse response = internalInvoiceService.getById(id);
        assertCanAccess(authentication, response);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<InternalInvoiceResponse>> getAll(Authentication authentication) {
        User actor = authService.getCurrentUser(authentication);
        if (warehouseAccessService.canAccessAllWarehouses(actor)) {
            return ResponseEntity.ok(internalInvoiceService.getAll());
        }
        return ResponseEntity.ok(internalInvoiceService.getAll().stream()
                .filter(response -> canAccess(actor, response))
                .toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        internalInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void assertCanAccess(Authentication authentication, InternalInvoiceResponse response) {
        User actor = authService.getCurrentUser(authentication);
        if (!canAccess(actor, response)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this transfer");
        }
    }

    private boolean canAccess(User actor, InternalInvoiceResponse response) {
        if (warehouseAccessService.canAccessAllWarehouses(actor)) {
            return true;
        }
        Integer sourceId = response.sourceWarehouse() != null ? response.sourceWarehouse().id() : null;
        Integer destinationId = response.destinationWarehouse() != null ? response.destinationWarehouse().id() : null;
        return canAccessWarehouse(actor, sourceId) || canAccessWarehouse(actor, destinationId);
    }

    private boolean canAccessWarehouse(User actor, Integer warehouseId) {
        if (warehouseId == null) {
            return false;
        }
        try {
            warehouseAccessService.assertCanAccessWarehouse(actor, warehouseId);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }
}
