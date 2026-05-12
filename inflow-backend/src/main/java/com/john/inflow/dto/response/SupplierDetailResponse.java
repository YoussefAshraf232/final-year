package com.john.inflow.dto.response;

import java.util.List;

public record SupplierDetailResponse(
    SupplierResponse supplier,
    long purchaseOrdersCount,
    List<SupplierPurchaseOrderResponse> recentPurchaseOrders
) {}
