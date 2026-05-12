package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateReturnPurchaseInvoiceRequest;
import com.john.inflow.dto.response.ReturnPurchaseInvoiceResponse;
import com.john.inflow.entity.User;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.ReturnPurchaseInvoiceService;
import com.john.inflow.service.WarehouseAccessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/return-purchase-invoices")
public class ReturnPurchaseInvoiceController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_DELETE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final ReturnPurchaseInvoiceService returnPurchaseInvoiceService;
    private final AuthService authService;
    private final WarehouseAccessService warehouseAccessService;

    public ReturnPurchaseInvoiceController(
            ReturnPurchaseInvoiceService returnPurchaseInvoiceService,
            AuthService authService,
            WarehouseAccessService warehouseAccessService
    ) {
        this.returnPurchaseInvoiceService = returnPurchaseInvoiceService;
        this.authService = authService;
        this.warehouseAccessService = warehouseAccessService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnPurchaseInvoiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateReturnPurchaseInvoiceRequest request
    ) {
        User actor = authService.getCurrentUser(authentication);
        warehouseAccessService.assertCanManageWarehouse(actor, request.warehouseId());
        Integer effectiveUserId = actor.getId();
        ReturnPurchaseInvoiceResponse response = returnPurchaseInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnPurchaseInvoiceResponse> getById(Authentication authentication, @PathVariable Integer id) {
        ReturnPurchaseInvoiceResponse response = returnPurchaseInvoiceService.getById(id);
        assertCanAccess(authentication, response);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ReturnPurchaseInvoiceResponse>> getAll(Authentication authentication) {
        User actor = authService.getCurrentUser(authentication);
        if (warehouseAccessService.canAccessAllWarehouses(actor)) {
            return ResponseEntity.ok(returnPurchaseInvoiceService.getAll());
        }
        return ResponseEntity.ok(returnPurchaseInvoiceService.getAll().stream()
                .filter(response -> canAccess(actor, response))
                .toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        returnPurchaseInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
    private void assertCanAccess(Authentication authentication, ReturnPurchaseInvoiceResponse response) {
        if (response.warehouse() != null) {
            warehouseAccessService.assertCanAccessWarehouse(authService.getCurrentUser(authentication), response.warehouse().id());
        }
    }
    private boolean canAccess(User actor, ReturnPurchaseInvoiceResponse response) {
        if (response.warehouse() == null) {
            return false;
        }
        try {
            warehouseAccessService.assertCanAccessWarehouse(actor, response.warehouse().id());
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }
}
