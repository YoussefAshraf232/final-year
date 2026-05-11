package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record ReturnSalesSummaryResponse(
    BigDecimal returnsTodayAmount,
    long pendingApprovalCount,
    BigDecimal refundedAmount,
    long pendingRestockCount
) {}
