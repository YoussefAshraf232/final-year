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
    @NotEmpty List<ReturnSalesInvoiceItemRequest> items
) {}
