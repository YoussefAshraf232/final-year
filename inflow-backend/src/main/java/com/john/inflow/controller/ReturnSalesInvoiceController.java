package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.ReturnSalesInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping({"/return-sales-invoices", "/return-invoices"})
public class ReturnSalesInvoiceController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_DELETE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final ReturnSalesInvoiceService returnSalesInvoiceService;
    private final AuthService authService;

    public ReturnSalesInvoiceController(ReturnSalesInvoiceService returnSalesInvoiceService, AuthService authService) {
        this.returnSalesInvoiceService = returnSalesInvoiceService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<ReturnSalesInvoiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateReturnSalesInvoiceRequest request
    ) {
        Integer effectiveUserId = authService.getCurrentUser(authentication).getId();
        ReturnSalesInvoiceResponse response = returnSalesInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnSalesInvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(returnSalesInvoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<ReturnSalesInvoiceResponse>> getAll() {
        return ResponseEntity.ok(returnSalesInvoiceService.getAll());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        returnSalesInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
