package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.service.ReturnSalesInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/return-sales-invoices")
public class ReturnSalesInvoiceController {

    private final ReturnSalesInvoiceService returnSalesInvoiceService;

    public ReturnSalesInvoiceController(ReturnSalesInvoiceService returnSalesInvoiceService) {
        this.returnSalesInvoiceService = returnSalesInvoiceService;
    }

    @PostMapping
    public ResponseEntity<ReturnSalesInvoiceResponse> create(
            @RequestHeader("X-User-Id") Integer userId,
            @Valid @RequestBody CreateReturnSalesInvoiceRequest request
    ) {
        ReturnSalesInvoiceResponse response = returnSalesInvoiceService.create(request, userId);
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
}
