package com.john.inflow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ReviewWarehouseStockRequest(
        @Min(1) Integer approvedQuantity,
        @Size(max = 1000) String comment
) {}
