package com.john.inflow.controller;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.PurchaseInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/purchase-invoices")
public class PurchaseInvoiceController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_DELETE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final PurchaseInvoiceService purchaseInvoiceService;
    private final AuthService authService;

    public PurchaseInvoiceController(PurchaseInvoiceService purchaseInvoiceService, AuthService authService) {
        this.purchaseInvoiceService = purchaseInvoiceService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<PurchaseInvoiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreatePurchaseInvoiceRequest request
    ) {
        Integer effectiveUserId = authService.getCurrentUser(authentication).getId();
        PurchaseInvoiceResponse response = purchaseInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseInvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseInvoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<PurchaseInvoiceResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(purchaseInvoiceService.getAll(page, size));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        purchaseInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
