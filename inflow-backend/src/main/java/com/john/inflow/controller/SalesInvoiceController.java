package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SalesInvoiceResponse;
import com.john.inflow.dto.response.SalesManagementSummaryResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.SalesInvoiceService;
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
@RequestMapping("/sales-invoices")
public class SalesInvoiceController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_DELETE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";
    private final SalesInvoiceService salesInvoiceService;
    private final AuthService authService;

    public SalesInvoiceController(SalesInvoiceService salesInvoiceService, AuthService authService) {
        this.salesInvoiceService = salesInvoiceService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<SalesInvoiceResponse> create(Authentication authentication, @Valid @RequestBody CreateSalesInvoiceRequest request) {
        Integer effectiveUserId = authService.getCurrentUser(authentication).getId();
        SalesInvoiceResponse response = salesInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesInvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(salesInvoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<SalesInvoiceResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(salesInvoiceService.search(search, status, dateFrom, dateTo, warehouseId, customerId, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<SalesManagementSummaryResponse> summary() {
        return ResponseEntity.ok(salesInvoiceService.summary());
    }

    @PostMapping("/{id}/void")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<SalesInvoiceResponse> voidInvoice(Authentication authentication, @PathVariable Integer id) {
        Integer effectiveUserId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(salesInvoiceService.voidInvoice(id, effectiveUserId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        salesInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
