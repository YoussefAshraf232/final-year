package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateReturnPurchaseInvoiceRequest;
import com.john.inflow.dto.response.ReturnPurchaseInvoiceResponse;
import com.john.inflow.service.ReturnPurchaseInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/return-purchase-invoices")
public class ReturnPurchaseInvoiceController {

    private final ReturnPurchaseInvoiceService returnPurchaseInvoiceService;

    public ReturnPurchaseInvoiceController(ReturnPurchaseInvoiceService returnPurchaseInvoiceService) {
        this.returnPurchaseInvoiceService = returnPurchaseInvoiceService;
    }

    @PostMapping
    public ResponseEntity<ReturnPurchaseInvoiceResponse> create(
            @RequestHeader("X-User-Id") Integer userId,
            @Valid @RequestBody CreateReturnPurchaseInvoiceRequest request
    ) {
        ReturnPurchaseInvoiceResponse response = returnPurchaseInvoiceService.create(request, userId);
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
}
