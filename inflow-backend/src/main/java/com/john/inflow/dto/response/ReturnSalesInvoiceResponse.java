package com.john.inflow.dto.response;

import com.john.inflow.dto.response.item.ReturnSalesInvoiceItemResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record ReturnSalesInvoiceResponse(
    Integer id,
    UserSummaryResponse user,
    Integer salesInvoiceId,
    CustomerResponse customer,
    WarehouseSummaryResponse warehouse,
    OffsetDateTime returnedAt,
    BigDecimal totalPrice,
    String reason,
    String returnStatus,
    String restockStatus,
    String refundStatus,
    String refundMethod,
    String notes,
    List<ReturnSalesInvoiceItemResponse> items
) {}
