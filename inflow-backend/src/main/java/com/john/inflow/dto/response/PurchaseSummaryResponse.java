package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record PurchaseSummaryResponse(
    long invoiceCount,
    BigDecimal totalPurchases
) {}
