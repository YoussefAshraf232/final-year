package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record CustomerPurchaseHistoryResponse(
    Integer customerId,
    String customerName,
    BigDecimal totalSales,
    BigDecimal outstandingBalance
) {}
