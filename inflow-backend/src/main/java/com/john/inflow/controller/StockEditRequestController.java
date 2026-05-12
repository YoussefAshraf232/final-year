package com.john.inflow.controller;

import com.john.inflow.dto.request.CreateStockEditRequest;
import com.john.inflow.dto.request.ReviewStockEditRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.StockEditRequestResponse;
import com.john.inflow.dto.response.StockEditRequestSummaryResponse;
import com.john.inflow.entity.User;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.StockEditRequestService;
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
@RequestMapping("/stock-edit-requests")
public class StockEditRequestController {
    private static final String CAN_VIEW = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_CREATE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private static final String CAN_REVIEW = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER')";

    private final StockEditRequestService service;
    private final AuthService authService;

    public StockEditRequestController(StockEditRequestService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @PostMapping
    @PreAuthorize(CAN_CREATE)
    public ResponseEntity<StockEditRequestResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateStockEditRequest request
    ) {
        User user = authService.getCurrentUser(authentication);
        StockEditRequestResponse response = service.create(request, user);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @PreAuthorize(CAN_VIEW)
    public ResponseEntity<PageResponse<StockEditRequestResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.search(search, status, productId, warehouseId, dateFrom, dateTo, page, size, authService.getCurrentUser(authentication)));
    }

    @GetMapping("/summary")
    @PreAuthorize(CAN_VIEW)
    public ResponseEntity<StockEditRequestSummaryResponse> summary(Authentication authentication) {
        return ResponseEntity.ok(service.getSummary(authService.getCurrentUser(authentication)));
    }

    @GetMapping("/{id}")
    @PreAuthorize(CAN_VIEW)
    public ResponseEntity<StockEditRequestResponse> getById(Authentication authentication, @PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id, authService.getCurrentUser(authentication)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize(CAN_REVIEW)
    public ResponseEntity<StockEditRequestResponse> approve(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody(required = false) ReviewStockEditRequest request
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(service.approve(id, request, userId));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(CAN_REVIEW)
    public ResponseEntity<StockEditRequestResponse> reject(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody(required = false) ReviewStockEditRequest request
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(service.reject(id, request, userId));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize(CAN_VIEW)
    public ResponseEntity<StockEditRequestResponse> cancel(
            Authentication authentication,
            @PathVariable Integer id
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(service.cancel(id, userId));
    }

    @PostMapping("/{id}/comment")
    @PreAuthorize(CAN_VIEW)
    public ResponseEntity<StockEditRequestResponse> comment(
            Authentication authentication,
            @PathVariable Integer id,
            @Valid @RequestBody ReviewStockEditRequest request
    ) {
        Integer userId = authService.getCurrentUser(authentication).getId();
        return ResponseEntity.ok(service.addComment(id, request, userId));
    }
}
