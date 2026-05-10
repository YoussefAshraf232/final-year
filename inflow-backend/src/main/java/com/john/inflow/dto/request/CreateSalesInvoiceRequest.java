package com.john.inflow.dto.request;

import com.john.inflow.dto.request.item.SalesInvoiceItemRequest;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record CreateSalesInvoiceRequest(
    @NotNull Integer customerId,
    @NotNull Integer warehouseId,
    @DecimalMin("0.0") BigDecimal discount,
    @NotEmpty List<SalesInvoiceItemRequest> items
) {}
