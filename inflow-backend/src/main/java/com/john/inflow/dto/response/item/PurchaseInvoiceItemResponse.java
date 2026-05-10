package com.john.inflow.dto.response.item;

import com.john.inflow.dto.response.ProductSummaryResponse;
import java.math.BigDecimal;

public record PurchaseInvoiceItemResponse(
    ProductSummaryResponse product,
    Integer amount,
    BigDecimal price
) {}
