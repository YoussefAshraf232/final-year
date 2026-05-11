package com.john.inflow.controller;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.request.ReceiveOrderRequest;
import com.john.inflow.dto.request.RejectOrderRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.dto.response.ReceiveSummaryResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.PurchaseInvoiceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.OffsetDateTime;

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
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String receiptStatus,
            @RequestParam(required = false) Integer supplierId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        boolean hasFilters = search != null || receiptStatus != null || supplierId != null
                || warehouseId != null || dateFrom != null || dateTo != null;
        if (hasFilters) {
            return ResponseEntity.ok(purchaseInvoiceService.search(search, receiptStatus, supplierId, warehouseId, dateFrom, dateTo, page, size));
        }
        return ResponseEntity.ok(purchaseInvoiceService.getAll(page, size));
    }

    @GetMapping("/receive-summary")
    public ResponseEntity<ReceiveSummaryResponse> receiveSummary() {
        return ResponseEntity.ok(purchaseInvoiceService.getReceiveSummary());
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<PurchaseInvoiceResponse> receive(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody ReceiveOrderRequest request
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(purchaseInvoiceService.receive(id, request, userId));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<PurchaseInvoiceResponse> reject(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody RejectOrderRequest request
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(purchaseInvoiceService.reject(id, request, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        purchaseInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
