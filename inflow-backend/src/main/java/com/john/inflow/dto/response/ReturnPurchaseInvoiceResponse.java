package com.john.inflow.dto.response;

import com.john.inflow.dto.response.item.ReturnPurchaseInvoiceItemResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record ReturnPurchaseInvoiceResponse(
    Integer id,
    UserSummaryResponse user,
    Integer purchaseInvoiceId,
    SupplierResponse supplier,
    WarehouseSummaryResponse warehouse,
    OffsetDateTime returnedAt,
    BigDecimal totalPrice,
    String reason,
    List<ReturnPurchaseInvoiceItemResponse> items
) {}
