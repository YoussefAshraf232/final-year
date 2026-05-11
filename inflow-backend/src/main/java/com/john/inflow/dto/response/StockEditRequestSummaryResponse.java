package com.john.inflow.dto.response;

public record StockEditRequestSummaryResponse(
        long pendingRequestsCount,
        long approvedTodayCount,
        long rejectedRequestsCount,
        long totalAdjustmentsThisMonth
) {}
