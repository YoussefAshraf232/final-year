package com.john.inflow.dto.request;

import com.john.inflow.dto.request.item.ReturnSalesInvoiceItemRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateReturnSalesInvoiceRequest(
    Integer salesInvoiceId,
    @NotNull Integer customerId,
    @NotNull Integer warehouseId,
    String reason,
    String refundMethod,
    String notes,
    @NotEmpty List<ReturnSalesInvoiceItemRequest> items
) {
    public CreateReturnSalesInvoiceRequest(Integer salesInvoiceId, Integer customerId, Integer warehouseId, String reason, List<ReturnSalesInvoiceItemRequest> items) {
        this(salesInvoiceId, customerId, warehouseId, reason, null, null, items);
    }
}
