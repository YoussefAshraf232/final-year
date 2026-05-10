package com.john.inflow.dto.request;

import com.john.inflow.dto.request.item.PurchaseInvoiceItemRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreatePurchaseInvoiceRequest(
    @NotNull Integer supplierId,
    @NotNull Integer warehouseId,
    @NotEmpty List<PurchaseInvoiceItemRequest> items
) {}
