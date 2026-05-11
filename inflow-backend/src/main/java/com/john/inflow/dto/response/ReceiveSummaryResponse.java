package com.john.inflow.dto.response;

public record ReceiveSummaryResponse(
        long pendingReceiptsCount,
        long receivedTodayCount,
        long partiallyReceivedCount,
        long damagedItemsCount
) {}
