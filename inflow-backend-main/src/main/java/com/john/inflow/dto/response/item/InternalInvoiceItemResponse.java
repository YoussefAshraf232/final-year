package com.john.inflow.dto.response.item;

import com.john.inflow.dto.response.ProductSummaryResponse;

public record InternalInvoiceItemResponse(
    ProductSummaryResponse product,
    Integer amount
) {}
