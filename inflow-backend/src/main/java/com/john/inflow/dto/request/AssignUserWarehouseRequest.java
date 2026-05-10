package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignUserWarehouseRequest(
    @NotNull(message = "User ID cannot be null")
    Integer userId,
    @NotNull(message = "Warehouse ID cannot be null")
    Integer warehouseId
) {}
