package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.response.SalesInvoiceResponse;
import com.john.inflow.service.SalesInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/sales-invoices")
public class SalesInvoiceController {

    private final SalesInvoiceService salesInvoiceService;

    public SalesInvoiceController(SalesInvoiceService salesInvoiceService) {
        this.salesInvoiceService = salesInvoiceService;
    }

    @PostMapping
    public ResponseEntity<SalesInvoiceResponse> create(
            @RequestHeader("X-User-Id") Integer userId,
            @Valid @RequestBody CreateSalesInvoiceRequest request
    ) {
        SalesInvoiceResponse response = salesInvoiceService.create(request, userId);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesInvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(salesInvoiceService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<SalesInvoiceResponse>> getAll() {
        return ResponseEntity.ok(salesInvoiceService.getAll());
    }
}
