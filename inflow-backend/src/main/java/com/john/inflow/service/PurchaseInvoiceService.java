package com.john.inflow.service;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.request.ReceiveOrderRequest;
import com.john.inflow.dto.request.RejectOrderRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;
import com.john.inflow.dto.response.ReceiveSummaryResponse;

import java.time.OffsetDateTime;

public interface PurchaseInvoiceService {
    PurchaseInvoiceResponse create(CreatePurchaseInvoiceRequest request, Integer userId);
    PurchaseInvoiceResponse getById(Integer id);
    PageResponse<PurchaseInvoiceResponse> getAll(int page, int size);
    PageResponse<PurchaseInvoiceResponse> search(
            String search,
            String receiptStatus,
            Integer supplierId,
            Integer warehouseId,
            OffsetDateTime dateFrom,
            OffsetDateTime dateTo,
            int page,
            int size
    );
    void delete(Integer id);

    PurchaseInvoiceResponse receive(Integer id, ReceiveOrderRequest request, Integer userId);
    PurchaseInvoiceResponse reject(Integer id, RejectOrderRequest request, Integer userId);
    ReceiveSummaryResponse getReceiveSummary();
}
