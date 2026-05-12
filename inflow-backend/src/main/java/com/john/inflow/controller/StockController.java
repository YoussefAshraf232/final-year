package com.john.inflow.controller;

import com.john.inflow.dto.request.StockAdjustmentRequest;
import com.john.inflow.dto.request.StockCountRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.StockMovementResponse;
import com.john.inflow.dto.response.StockOnHandResponse;
import com.john.inflow.dto.response.StockSummaryResponse;
import com.john.inflow.entity.User;
import com.john.inflow.service.AuthService;
import com.john.inflow.service.StockMovementService;
import com.john.inflow.service.StockService;
import com.john.inflow.service.WarehouseAccessService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/stock")
public class StockController {
    private static final String CAN_WRITE = "hasAnyRole('SYSTEM_ADMIN','OPERATIONAL_MANAGER','WAREHOUSE_MANAGER')";
    private final StockService stockService;
    private final StockMovementService stockMovementService;
    private final AuthService authService;
    private final WarehouseAccessService warehouseAccessService;

    public StockController(
            StockService stockService,
            StockMovementService stockMovementService,
            AuthService authService,
            WarehouseAccessService warehouseAccessService
    ) {
        this.stockService = stockService;
        this.stockMovementService = stockMovementService;
        this.authService = authService;
        this.warehouseAccessService = warehouseAccessService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<StockOnHandResponse>> getAllStock(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Integer scopedWarehouseId = scopedWarehouse(authentication, warehouseId);
        return ResponseEntity.ok(page(stockService.getAllStock(search, scopedWarehouseId, status, lowStockOnly), page, size));
    }

    @GetMapping("/on-hand")
    public ResponseEntity<PageResponse<StockOnHandResponse>> getStockOnHand(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Integer scopedWarehouseId = scopedWarehouse(authentication, warehouseId);
        return ResponseEntity.ok(page(stockService.getAllStock(search, scopedWarehouseId, status, lowStockOnly), page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<StockSummaryResponse> getSummary(Authentication authentication) {
        return ResponseEntity.ok(stockService.getSummary(scopedWarehouse(authentication, null)));
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<PageResponse<StockOnHandResponse>> getStockByWarehouse(
            Authentication authentication,
            @PathVariable Integer warehouseId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        warehouseAccessService.assertCanAccessWarehouse(authService.getCurrentUser(authentication), warehouseId);
        return ResponseEntity.ok(page(stockService.getAllStock(search, warehouseId, status, lowStockOnly), page, size));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockOnHandResponse>> getStockByProduct(Authentication authentication, @PathVariable Integer productId) {
        Integer warehouseId = scopedWarehouse(authentication, null);
        return ResponseEntity.ok(stockService.getStockByProduct(productId).stream()
                .filter(row -> warehouseId == null || row.warehouseId().equals(warehouseId))
                .toList());
    }

    @GetMapping("/movements")
    public ResponseEntity<PageResponse<StockMovementResponse>> getMovements(
            Authentication authentication,
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Integer scopedWarehouseId = scopedWarehouse(authentication, warehouseId);
        return ResponseEntity.ok(stockMovementService.getAll(productId, scopedWarehouseId, movementType, dateFrom, dateTo, page, size));
    }

    private <T> PageResponse<T> page(List<T> rows, int page, int size) {
        int safeSize = Math.max(size, 1);
        int fromIndex = Math.min(Math.max(page, 0) * safeSize, rows.size());
        int toIndex = Math.min(fromIndex + safeSize, rows.size());
        List<T> content = fromIndex >= toIndex ? Collections.emptyList() : rows.subList(fromIndex, toIndex);
        int totalPages = rows.isEmpty() ? 0 : (int) Math.ceil((double) rows.size() / safeSize);
        return new PageResponse<>(content, rows.size(), totalPages, page <= 0, page >= totalPages - 1);
    }

    @PostMapping("/adjustments")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> adjustStock(Authentication authentication, @Valid @RequestBody StockAdjustmentRequest request) {
        User user = authService.getCurrentUser(authentication);
        warehouseAccessService.assertCanManageWarehouse(user, request.warehouseId());
        stockService.adjustStock(request, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/counts")
    @PreAuthorize(CAN_WRITE)
    public ResponseEntity<Void> updateStockCount(Authentication authentication, @Valid @RequestBody StockCountRequest request) {
        User user = authService.getCurrentUser(authentication);
        warehouseAccessService.assertCanManageWarehouse(user, request.warehouseId());
        stockService.updateStockCount(request, user);
        return ResponseEntity.ok().build();
    }

    private Integer scopedWarehouse(Authentication authentication, Integer warehouseId) {
        if (authentication == null) {
            return warehouseId;
        }
        return warehouseAccessService.scopeWarehouseId(authService.getCurrentUser(authentication), warehouseId);
    }
}
