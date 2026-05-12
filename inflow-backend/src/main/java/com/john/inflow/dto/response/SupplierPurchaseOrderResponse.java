package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SupplierPurchaseOrderResponse(
    Integer id,
    OffsetDateTime createdAt,
    BigDecimal totalAmount,
    String receiptStatus
) {}
