package com.john.inflow.dto.request.item;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InternalInvoiceItemRequest(
    @NotNull Integer productId,
    @NotNull @Min(1) Integer amount
) {}
