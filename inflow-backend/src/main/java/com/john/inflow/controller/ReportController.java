package com.john.inflow.controller;

import com.john.inflow.dto.response.ReportResultResponse;
import com.john.inflow.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/stock-on-hand")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getStockOnHand() {
        return ResponseEntity.ok(reportService.getStockOnHand());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getLowStock() {
        return ResponseEntity.ok(reportService.getLowStock());
    }

    @GetMapping("/stock-movements")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getStockMovements(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer warehouseId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(reportService.getStockMovements(productId, warehouseId, movementType, dateFrom, dateTo, page, size));
    }

    @GetMapping("/sales-summary")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getSalesSummary() {
        return ResponseEntity.ok(reportService.getSalesSummary());
    }

    @GetMapping("/purchase-summary")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getPurchaseSummary() {
        return ResponseEntity.ok(reportService.getPurchaseSummary());
    }

    @GetMapping("/returns")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getReturnsSummary() {
        return ResponseEntity.ok(reportService.getReturnsSummary());
    }

    @GetMapping("/product-performance")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getProductPerformance() {
        return ResponseEntity.ok(reportService.getProductPerformance());
    }

    @GetMapping("/warehouse")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getWarehouseReport() {
        return ResponseEntity.ok(reportService.getWarehouseReport());
    }

    @GetMapping("/supplier-performance")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getSupplierPerformance() {
        return ResponseEntity.ok(reportService.getSupplierPerformance());
    }

    @GetMapping("/customer-purchase-history")
    public ResponseEntity<ReportResultResponse<Map<String, Object>>> getCustomerPurchaseHistory() {
        return ResponseEntity.ok(reportService.getCustomerPurchaseHistory());
    }
}
