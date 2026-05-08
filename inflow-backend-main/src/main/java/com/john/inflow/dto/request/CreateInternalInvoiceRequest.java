package com.john.inflow.dto.request;

import com.john.inflow.dto.request.item.InternalInvoiceItemRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateInternalInvoiceRequest(
    @NotNull Integer sourceWarehouseId,
    @NotNull Integer destinationWarehouseId,
    @NotEmpty List<InternalInvoiceItemRequest> items
) {}
