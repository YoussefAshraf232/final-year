package com.john.inflow.exception;

import lombok.Getter;

@Getter
public class InsufficientStockException extends RuntimeException {
    private final String productName;
    private final Integer warehouseId;
    private final Integer requested;
    private final Integer available;

    public InsufficientStockException(String productName, Integer warehouseId, Integer requested, Integer available) {
        super(String.format("Insufficient stock for product '%s' in warehouse %d: requested %d, available %d", productName, warehouseId, requested, available));
        this.productName = productName;
        this.warehouseId = warehouseId;
        this.requested = requested;
        this.available = available;
    }
}
