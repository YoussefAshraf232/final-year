package com.john.inflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockCountRequest(
    @NotNull Integer productId,
    @NotNull Integer warehouseId,
    @NotNull @Min(0) Integer countedAmount // absolute amount
) {}
