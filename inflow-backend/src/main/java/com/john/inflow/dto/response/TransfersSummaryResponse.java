package com.john.inflow.dto.response;

public record TransfersSummaryResponse(
    long pendingCount,
    long inTransitCount,
    long completedThisWeekCount,
    long destinationWarehousesCount
) {}
