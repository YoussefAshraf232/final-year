package com.john.inflow.dto.response;

import com.john.inflow.dto.response.item.PurchaseInvoiceItemResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record PurchaseInvoiceResponse(
    Integer id,
    UserSummaryResponse user,
    SupplierResponse supplier,
    WarehouseSummaryResponse warehouse,
    OffsetDateTime createdAt,
    BigDecimal totalPrice,
    String receiptStatus,
    OffsetDateTime receivedAt,
    UserSummaryResponse receivedByUser,
    String receivingNotes,
    Integer totalOrderedQuantity,
    Integer totalReceivedQuantity,
    Integer totalDamagedQuantity,
    Integer totalMissingQuantity,
    List<PurchaseInvoiceItemResponse> items
) {}
