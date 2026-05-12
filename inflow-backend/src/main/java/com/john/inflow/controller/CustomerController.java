package com.john.inflow.controller;

import com.john.inflow.dto.request.CustomerRequest;
import com.john.inflow.dto.response.CustomerDetailResponse;
import com.john.inflow.dto.response.CustomerResponse;
import com.john.inflow.dto.response.CustomerSummaryResponse;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/customers")
public class CustomerController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.create(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<CustomerResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String salesActivity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(customerService.getAll(search, status, salesActivity, createdFrom, createdTo, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<CustomerSummaryResponse> getSummary() {
        return ResponseEntity.ok(customerService.getSummary());
    }

    @PutMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<CustomerResponse> update(@PathVariable Integer id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<CustomerResponse> deactivate(@PathVariable Integer id) {
        return ResponseEntity.ok(customerService.deactivate(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
