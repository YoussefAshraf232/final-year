package com.john.inflow.dto.request.item;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReceiveOrderItemRequest(
        @NotNull Integer productId,
        @NotNull @Min(0) Integer receivedQuantity,
        @NotNull @Min(0) Integer damagedQuantity,
        String notes
) {}
