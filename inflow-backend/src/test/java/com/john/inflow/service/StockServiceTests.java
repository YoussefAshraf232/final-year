package com.john.inflow.service;

import com.john.inflow.dto.request.StockAdjustmentRequest;
import com.john.inflow.dto.request.StockCountRequest;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InsufficientStockException;
import com.john.inflow.repository.ProductWarehouseRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class StockServiceTests {
    private final ProductWarehouseRepository productWarehouseRepository = mock(ProductWarehouseRepository.class);
    private final StockMovementService stockMovementService = mock(StockMovementService.class);
    private final AuditLogService auditLogService = mock(AuditLogService.class);
    private final StockService stockService = new StockService(productWarehouseRepository, stockMovementService, auditLogService);

    @Test
    void adjustmentIncreasesStockAndRecordsMovement() {
        ProductWarehouse stock = stock(5);
        when(productWarehouseRepository.findById(new ProductWarehouseId(1, 2))).thenReturn(Optional.of(stock));

        stockService.adjustStock(new StockAdjustmentRequest(1, 2, 3), actor());

        assertThat(stock.getAmount()).isEqualTo(8);
        verify(productWarehouseRepository).save(stock);
        verify(stockMovementService).record(eq(stock.getProduct()), eq(stock.getWarehouse()), eq("ADJUSTMENT"), eq(3), isNull(), eq("STOCK_ADJUSTMENT"), isNull(), anyString(), any(User.class));
        verify(auditLogService).log(any(User.class), eq("ADJUST"), eq("STOCK"), eq("1:2"), eq("amount=3"));
    }

    @Test
    void adjustmentCannotDropBelowZero() {
        when(productWarehouseRepository.findById(new ProductWarehouseId(1, 2))).thenReturn(Optional.of(stock(2)));

        assertThatThrownBy(() -> stockService.adjustStock(new StockAdjustmentRequest(1, 2, -3), actor()))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void stockCountSetsAbsoluteQuantityAndRecordsDelta() {
        ProductWarehouse stock = stock(7);
        when(productWarehouseRepository.findById(new ProductWarehouseId(1, 2))).thenReturn(Optional.of(stock));

        stockService.updateStockCount(new StockCountRequest(1, 2, 4), actor());

        assertThat(stock.getAmount()).isEqualTo(4);
        verify(stockMovementService).record(eq(stock.getProduct()), eq(stock.getWarehouse()), eq("COUNT"), eq(-3), isNull(), eq("STOCK_COUNT"), isNull(), anyString(), any(User.class));
        verify(auditLogService).log(any(User.class), eq("COUNT"), eq("STOCK"), eq("1:2"), eq("countedAmount=4"));
    }

    private ProductWarehouse stock(int amount) {
        Product product = Product.builder()
                .id(1)
                .name("Cable")
                .currentPrice(BigDecimal.TEN)
                .build();
        Warehouse warehouse = Warehouse.builder()
                .id(2)
                .address("Main")
                .build();
        return ProductWarehouse.builder()
                .id(new ProductWarehouseId(1, 2))
                .product(product)
                .warehouse(warehouse)
                .amount(amount)
                .build();
    }

    private User actor() {
        return User.builder().id(9).username("manager").email("m@example.com").phoneNumber("000").passwordHash("x").build();
    }
}
