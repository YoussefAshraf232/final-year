package com.john.inflow.dto.request;

import com.john.inflow.dto.request.item.ReturnPurchaseInvoiceItemRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateReturnPurchaseInvoiceRequest(
    Integer purchaseInvoiceId,
    @NotNull Integer supplierId,
    @NotNull Integer warehouseId,
    String reason,
    @NotEmpty List<ReturnPurchaseInvoiceItemRequest> items
) {}
