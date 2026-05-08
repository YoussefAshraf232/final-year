package com.john.inflow.controller;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.service.PurchaseInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/purchase-invoices")
public class PurchaseInvoiceController {

    private final PurchaseInvoiceService purchaseInvoiceService;

    public PurchaseInvoiceController(PurchaseInvoiceService purchaseInvoiceService) {
        this.purchaseInvoiceService = purchaseInvoiceService;
    }

    @PostMapping
    public ResponseEntity<PurchaseInvoiceResponse> create(
            @RequestHeader("X-User-Id") Integer userId,
            @Valid @RequestBody CreatePurchaseInvoiceRequest request
    ) {
        PurchaseInvoiceResponse response = purchaseInvoiceService.create(request, userId);
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
    public ResponseEntity<List<PurchaseInvoiceResponse>> getAll() {
        return ResponseEntity.ok(purchaseInvoiceService.getAll());
    }
}
