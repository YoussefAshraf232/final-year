package com.john.inflow.service;

import com.john.inflow.dto.request.StockAdjustmentRequest;
import com.john.inflow.dto.request.StockCountRequest;
import com.john.inflow.dto.response.StockOnHandResponse;
import com.john.inflow.dto.response.StockSummaryResponse;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.StockMovement;
import com.john.inflow.entity.User;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.repository.ProductWarehouseRepository;
import com.john.inflow.repository.StockMovementRepository;
import com.john.inflow.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StockService {
    private static final int DEFAULT_REORDER_LEVEL = 10;

    private final ProductWarehouseRepository productWarehouseRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    @Autowired
    public StockService(
            ProductWarehouseRepository productWarehouseRepository,
            WarehouseRepository warehouseRepository,
            StockMovementRepository stockMovementRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService
    ) {
        this.productWarehouseRepository = productWarehouseRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    public StockService(
            ProductWarehouseRepository productWarehouseRepository,
            StockMovementService stockMovementService,
            AuditLogService auditLogService
    ) {
        this(productWarehouseRepository, null, null, stockMovementService, auditLogService);
    }

    public List<StockOnHandResponse> getAllStock(
            String search,
            Integer warehouseId,
            String status,
            boolean lowStockOnly
    ) {
        String normalizedSearch = normalize(search);
        String normalizedStatus = normalizeStatus(status);
        return productWarehouseRepository.findAllWithProductAndWarehouse().stream()
            .map(this::toResponse)
            .filter(row -> warehouseId == null || row.warehouseId().equals(warehouseId))
            .filter(row -> normalizedSearch == null || matchesSearch(row, normalizedSearch))
            .filter(row -> normalizedStatus == null || row.status().equals(normalizedStatus))
            .filter(row -> !lowStockOnly || row.status().equals("LOW_STOCK") || row.status().equals("OUT_OF_STOCK"))
            .sorted(Comparator.comparing(StockOnHandResponse::productName).thenComparing(StockOnHandResponse::warehouseName))
            .toList();
    }

    public List<StockOnHandResponse> getStockByWarehouse(Integer warehouseId) {
        return getAllStock(null, warehouseId, null, false);
    }

    public List<StockOnHandResponse> getStockByProduct(Integer productId) {
        return getAllStock(null, null, null, false).stream()
            .filter(s -> s.productId().equals(productId))
            .toList();
    }

    public StockSummaryResponse getSummary() {
        return getSummary(null);
    }

    public StockSummaryResponse getSummary(Integer warehouseId) {
        List<StockOnHandResponse> rows = getAllStock(null, warehouseId, null, false);
        Set<Integer> productIds = rows.stream().map(StockOnHandResponse::productId).collect(Collectors.toSet());
        long warehouseCount = warehouseId != null ? 1 : warehouseRepository == null ? 0 : warehouseRepository.count();
        long stockWarehouses = rows.stream().map(StockOnHandResponse::warehouseId).distinct().count();
        long lowStockItems = rows.stream().filter(row -> row.status().equals("LOW_STOCK")).count();
        long outOfStockItems = rows.stream().filter(row -> row.status().equals("OUT_OF_STOCK")).count();
        return new StockSummaryResponse(
            productIds.size(),
            warehouseCount > 0 ? warehouseCount : stockWarehouses,
            lowStockItems,
            outOfStockItems
        );
    }

    private StockOnHandResponse toResponse(ProductWarehouse stock) {
        int onHand = stock.getAmount() == null ? 0 : stock.getAmount();
        int reserved = 0;
        int available = Math.max(onHand - reserved, 0);
        int reorderLevel = DEFAULT_REORDER_LEVEL;
        BigDecimal unitValue = stock.getProduct().getCurrentPrice() == null ? BigDecimal.ZERO : stock.getProduct().getCurrentPrice();
        BigDecimal totalValue = unitValue.multiply(BigDecimal.valueOf(available));
        OffsetDateTime lastMovementAt = stockMovementRepository == null
            ? null
            : stockMovementRepository
                .findTopByProductIdAndWarehouseIdOrderByCreatedAtDesc(stock.getProduct().getId(), stock.getWarehouse().getId())
                .map(StockMovement::getCreatedAt)
                .orElse(null);

        return new StockOnHandResponse(
            stock.getProduct().getId(),
            stock.getProduct().getName(),
            "SKU-" + stock.getProduct().getId(),
            stock.getWarehouse().getId(),
            stock.getWarehouse().getAddress(),
            onHand,
            reserved,
            available,
            reorderLevel,
            unitValue,
            totalValue,
            lastMovementAt,
            lastMovementAt,
            calculateStatus(available, reorderLevel)
        );
    }

    private String calculateStatus(int available, int reorderLevel) {
        if (available <= 0) return "OUT_OF_STOCK";
        if (available <= reorderLevel) return "LOW_STOCK";
        return "OK";
    }

    private boolean matchesSearch(StockOnHandResponse row, String search) {
        return row.productName().toLowerCase(Locale.ROOT).contains(search)
            || row.sku().toLowerCase(Locale.ROOT).contains(search)
            || String.valueOf(row.productId()).contains(search)
            || row.warehouseName().toLowerCase(Locale.ROOT).contains(search);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeStatus(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    @Transactional
    public void adjustStock(StockAdjustmentRequest request, User actor) {
        ProductWarehouse pw = requireStock(request.productId(), request.warehouseId());
        int newAmount = pw.getAmount() + request.adjustmentAmount();
        if (newAmount < 0) {
            throw new InsufficientStockException(pw.getProduct().getName(), request.warehouseId(), Math.abs(request.adjustmentAmount()), pw.getAmount());
        }
        pw.setAmount(newAmount);
        productWarehouseRepository.save(pw);
        stockMovementService.record(
                pw.getProduct(),
                pw.getWarehouse(),
                "ADJUSTMENT",
                request.adjustmentAmount(),
                null,
                "STOCK_ADJUSTMENT",
                null,
                "Manual stock adjustment",
                actor
        );
        auditLogService.log(actor, "ADJUST", "STOCK", request.productId() + ":" + request.warehouseId(), "amount=" + request.adjustmentAmount());
    }

    @Transactional
    public void updateStockCount(StockCountRequest request, User actor) {
        ProductWarehouse pw = requireStock(request.productId(), request.warehouseId());
        int delta = request.countedAmount() - pw.getAmount();
        pw.setAmount(request.countedAmount());
        productWarehouseRepository.save(pw);
        stockMovementService.record(
                pw.getProduct(),
                pw.getWarehouse(),
                "COUNT",
                delta,
                null,
                "STOCK_COUNT",
                null,
                "Manual stock count",
                actor
        );
        auditLogService.log(actor, "COUNT", "STOCK", request.productId() + ":" + request.warehouseId(), "countedAmount=" + request.countedAmount());
    }

    private ProductWarehouse requireStock(Integer productId, Integer warehouseId) {
        ProductWarehouseId id = new ProductWarehouseId(productId, warehouseId);
        return productWarehouseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Stock", productId + ":" + warehouseId));
    }
}
