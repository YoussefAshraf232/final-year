package com.john.inflow.dto.response.item;

import com.john.inflow.dto.response.ProductSummaryResponse;
import java.math.BigDecimal;

public record SalesInvoiceItemResponse(
    ProductSummaryResponse product,
    Integer amount,
    BigDecimal sellingPrice
) {}
