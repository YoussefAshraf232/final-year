package com.john.inflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStockEditRequest(
        @NotNull Integer productId,
        @NotNull Integer warehouseId,
        @NotNull @Min(0) Integer requestedQuantity,
        @NotBlank @Size(max = 80) String reason,
        @Size(max = 1000) String notes
) {}
