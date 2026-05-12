package com.john.inflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateWarehouseStockRequest(
        @NotNull Integer productId,
        @NotNull Integer sourceWarehouseId,
        Integer destinationWarehouseId,
        @NotNull @Min(1) Integer requestedQuantity,
        @NotBlank @Size(max = 120) String reason,
        @Size(max = 1000) String notes
) {}
