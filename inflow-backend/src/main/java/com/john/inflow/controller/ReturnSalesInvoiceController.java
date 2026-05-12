package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.dto.response.ReturnSalesSummaryResponse;
import com.john.inflow.entity.User;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.ReturnSalesInvoiceService;
import com.john.inflow.service.WarehouseAccessService;
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
@RequestMapping({"/return-sales-invoices", "/return-invoices"})
public class ReturnSalesInvoiceController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_DELETE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";
    private final ReturnSalesInvoiceService returnSalesInvoiceService;
    private final AuthService authService;
    private final WarehouseAccessService warehouseAccessService;

    public ReturnSalesInvoiceController(
            ReturnSalesInvoiceService returnSalesInvoiceService,
            AuthService authService,
            WarehouseAccessService warehouseAccessService
    ) {
        this.returnSalesInvoiceService = returnSalesInvoiceService;
        this.authService = authService;
        this.warehouseAccessService = warehouseAccessService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnSalesInvoiceResponse> create(Authentication authentication, @Valid @RequestBody CreateReturnSalesInvoiceRequest request) {
        User actor = authService.getCurrentUser(authentication);
        warehouseAccessService.assertCanManageWarehouse(actor, request.warehouseId());
        Integer effectiveUserId = actor.getId();
        ReturnSalesInvoiceResponse response = returnSalesInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnSalesInvoiceResponse> getById(Authentication authentication, @PathVariable Integer id) {
        ReturnSalesInvoiceResponse response = returnSalesInvoiceService.getById(id);
        assertCanAccess(authentication, response);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<ReturnSalesInvoiceResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String returnStatus,
            @RequestParam(required = false) String restockStatus,
            @RequestParam(required = false) String refundStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        Integer scopedWarehouseId = warehouseAccessService.scopeWarehouseId(authService.getCurrentUser(authentication), warehouseId);
        return ResponseEntity.ok(returnSalesInvoiceService.search(search, returnStatus, restockStatus, refundStatus, dateFrom, dateTo, scopedWarehouseId, customerId, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<ReturnSalesSummaryResponse> summary() {
        return ResponseEntity.ok(returnSalesInvoiceService.summary());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnSalesInvoiceResponse> approve(Authentication authentication, @PathVariable Integer id) {
        assertCanAccess(authentication, returnSalesInvoiceService.getById(id));
        return ResponseEntity.ok(returnSalesInvoiceService.approve(id, authService.getCurrentUser(authentication).getId()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnSalesInvoiceResponse> reject(Authentication authentication, @PathVariable Integer id) {
        assertCanAccess(authentication, returnSalesInvoiceService.getById(id));
        return ResponseEntity.ok(returnSalesInvoiceService.reject(id, authService.getCurrentUser(authentication).getId()));
    }

    @PostMapping("/{id}/restock")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnSalesInvoiceResponse> restock(Authentication authentication, @PathVariable Integer id) {
        assertCanAccess(authentication, returnSalesInvoiceService.getById(id));
        return ResponseEntity.ok(returnSalesInvoiceService.restock(id, authService.getCurrentUser(authentication).getId()));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnSalesInvoiceResponse> refund(Authentication authentication, @PathVariable Integer id) {
        assertCanAccess(authentication, returnSalesInvoiceService.getById(id));
        return ResponseEntity.ok(returnSalesInvoiceService.refund(id, authService.getCurrentUser(authentication).getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        returnSalesInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void assertCanAccess(Authentication authentication, ReturnSalesInvoiceResponse response) {
        if (response.warehouse() != null) {
            warehouseAccessService.assertCanAccessWarehouse(authService.getCurrentUser(authentication), response.warehouse().id());
        }
    }
}
