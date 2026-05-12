package com.john.inflow.dto.response;

public record WarehousesSummaryResponse(
    long totalWarehouses,
    long centralWarehouses,
    long branchWarehouses,
    long activeManagers
) {}
