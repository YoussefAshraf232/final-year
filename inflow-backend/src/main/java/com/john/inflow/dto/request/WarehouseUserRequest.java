package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotNull;

public record WarehouseUserRequest(@NotNull Integer userId) {}
