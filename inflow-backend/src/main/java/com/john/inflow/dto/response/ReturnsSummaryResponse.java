package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record ReturnsSummaryResponse(
    long returnSalesCount,
    BigDecimal totalReturnSales,
    long returnPurchasesCount,
    BigDecimal totalReturnPurchases
) {}
