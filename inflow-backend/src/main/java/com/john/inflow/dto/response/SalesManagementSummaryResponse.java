package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record SalesManagementSummaryResponse(
    BigDecimal todaySalesAmount,
    long pendingOrdersCount,
    BigDecimal returnsTodayAmount,
    long lowStockAlertsCount
) {}
