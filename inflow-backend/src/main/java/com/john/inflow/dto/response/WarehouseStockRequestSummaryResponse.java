package com.john.inflow.dto.response;

public record WarehouseStockRequestSummaryResponse(
        long outgoingPendingCount,
        long incomingPendingCount,
        long acceptedTodayCount,
        long rejectedCount
) {}
