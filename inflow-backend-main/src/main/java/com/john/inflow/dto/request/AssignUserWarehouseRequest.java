package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignUserWarehouseRequest(
    @NotNull Integer userId,
    @NotNull Integer warehouseId
) {}
