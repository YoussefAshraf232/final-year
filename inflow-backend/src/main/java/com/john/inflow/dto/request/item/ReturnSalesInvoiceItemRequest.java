package com.john.inflow.dto.request.item;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ReturnSalesInvoiceItemRequest(
    @NotNull Integer productId,
    @NotNull @Min(1) Integer amount,
    @NotNull @DecimalMin("0.0") BigDecimal priceAtReturn
) {}
