package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateInternalInvoiceRequest;
import com.john.inflow.dto.response.InternalInvoiceResponse;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.InternalInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
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

    public InternalInvoiceController(InternalInvoiceService internalInvoiceService, AuthService authService) {
        this.internalInvoiceService = internalInvoiceService;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<InternalInvoiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateInternalInvoiceRequest request
    ) {
        Integer effectiveUserId = authService.getCurrentUser(authentication).getId();
        InternalInvoiceResponse response = internalInvoiceService.create(request, effectiveUserId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternalInvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(internalInvoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<InternalInvoiceResponse>> getAll() {
        return ResponseEntity.ok(internalInvoiceService.getAll());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_DELETE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        internalInvoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
