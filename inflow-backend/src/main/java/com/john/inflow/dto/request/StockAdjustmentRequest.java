package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotNull;

public record StockAdjustmentRequest(
    @NotNull Integer productId,
    @NotNull Integer warehouseId,
    @NotNull Integer adjustmentAmount // positive or negative
) {}
