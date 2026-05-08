package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateInternalInvoiceRequest;
import com.john.inflow.dto.response.InternalInvoiceResponse;
import com.john.inflow.service.InternalInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/internal-invoices")
public class InternalInvoiceController {

    private final InternalInvoiceService internalInvoiceService;

    public InternalInvoiceController(InternalInvoiceService internalInvoiceService) {
        this.internalInvoiceService = internalInvoiceService;
    }

    @PostMapping
    public ResponseEntity<InternalInvoiceResponse> create(
            @RequestHeader("X-User-Id") Integer userId,
            @Valid @RequestBody CreateInternalInvoiceRequest request
    ) {
        InternalInvoiceResponse response = internalInvoiceService.create(request, userId);
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
}
