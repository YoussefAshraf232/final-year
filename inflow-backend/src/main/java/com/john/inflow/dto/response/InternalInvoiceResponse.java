package com.john.inflow.dto.response;

import com.john.inflow.dto.response.item.InternalInvoiceItemResponse;
import java.time.OffsetDateTime;
import java.util.List;

public record InternalInvoiceResponse(
    Integer id,
    UserSummaryResponse user,
    WarehouseSummaryResponse sourceWarehouse,
    WarehouseSummaryResponse destinationWarehouse,
    OffsetDateTime createdAt,
    List<InternalInvoiceItemResponse> items
) {}
