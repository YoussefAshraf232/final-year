package com.john.inflow.dto.response;

public record SupplierStatsResponse(
    long totalSuppliers,
    long activeSuppliers,
    long linkedProducts,
    long purchaseOrdersThisMonth
) {}
