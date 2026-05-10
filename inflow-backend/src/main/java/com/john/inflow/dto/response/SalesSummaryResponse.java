package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record SalesSummaryResponse(
    long invoiceCount,
    BigDecimal totalSales
) {}
