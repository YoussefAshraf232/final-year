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
    String paymentMethod,
    @DecimalMin("0.0") BigDecimal paidAmount,
    String status,
    String notes,
    @NotEmpty List<SalesInvoiceItemRequest> items
) {
    public CreateSalesInvoiceRequest(Integer customerId, Integer warehouseId, BigDecimal discount, List<SalesInvoiceItemRequest> items) {
        this(customerId, warehouseId, discount, null, null, null, null, items);
    }
}
