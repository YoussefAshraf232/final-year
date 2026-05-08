package com.john.inflow.dto.response;

import com.john.inflow.dto.response.item.SalesInvoiceItemResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record SalesInvoiceResponse(
    Integer id,
    UserSummaryResponse user,
    CustomerResponse customer,
    WarehouseSummaryResponse warehouse,
    OffsetDateTime createdAt,
    BigDecimal totalPrice,
    BigDecimal discount,
    List<SalesInvoiceItemResponse> items
) {}
