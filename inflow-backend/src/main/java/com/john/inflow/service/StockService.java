package com.john.inflow.service;

import com.john.inflow.dto.request.StockAdjustmentRequest;
import com.john.inflow.dto.request.StockCountRequest;
import com.john.inflow.dto.response.StockOnHandResponse;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.User;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.exception.ResourceNotFoundException;
import com.john.inflow.repository.ProductWarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class StockService {
    private final ProductWarehouseRepository productWarehouseRepository;
    private final StockMovementService stockMovementService;
    private final AuditLogService auditLogService;

    public StockService(ProductWarehouseRepository productWarehouseRepository, StockMovementService stockMovementService, AuditLogService auditLogService) {
        this.productWarehouseRepository = productWarehouseRepository;
        this.stockMovementService = stockMovementService;
        this.auditLogService = auditLogService;
    }

    public List<StockOnHandResponse> getAllStock() {
        return productWarehouseRepository.getStockOnHand();
    }

    public List<StockOnHandResponse> getStockByWarehouse(Integer warehouseId) {
        return productWarehouseRepository.getStockOnHand().stream()
            .filter(s -> s.warehouseId().equals(warehouseId))
            .toList();
    }

    public List<StockOnHandResponse> getStockByProduct(Integer productId) {
        return productWarehouseRepository.getStockOnHand().stream()
            .filter(s -> s.productId().equals(productId))
            .toList();
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
