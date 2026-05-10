package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateReturnPurchaseInvoiceRequest;
import com.john.inflow.dto.response.ReturnPurchaseInvoiceResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.ReturnPurchaseInvoiceService;
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

    public ReturnPurchaseInvoiceController(ReturnPurchaseInvoiceService returnPurchaseInvoiceService, AuthService authService) {
        this.returnPurchaseInvoiceService = returnPurchaseInvoiceService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnPurchaseInvoiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateReturnPurchaseInvoiceRequest request
    ) {
        Integer effectiveUserId = authService.getCurrentUser(authentication).getId();
        ReturnPurchaseInvoiceResponse response = returnPurchaseInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnPurchaseInvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(returnPurchaseInvoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ReturnPurchaseInvoiceResponse>> getAll() {
        return ResponseEntity.ok(returnPurchaseInvoiceService.getAll());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        returnPurchaseInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
