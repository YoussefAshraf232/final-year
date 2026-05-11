package com.john.inflow.dto.request;

import com.john.inflow.dto.request.item.ReceiveOrderItemRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;

public record ReceiveOrderRequest(
        @NotNull ReceiveMode mode,
        OffsetDateTime receivingDate,
        String notes,
        @NotEmpty @Valid List<ReceiveOrderItemRequest> items
) {
    public enum ReceiveMode { CONFIRM, PARTIAL, DAMAGED }
}
