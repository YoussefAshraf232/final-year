package com.john.inflow.service;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SalesInvoiceResponse;
import com.john.inflow.dto.response.SalesManagementSummaryResponse;

import java.time.OffsetDateTime;

public interface SalesInvoiceService {
    SalesInvoiceResponse create(CreateSalesInvoiceRequest request, Integer userId);
    SalesInvoiceResponse getById(Integer id);
    PageResponse<SalesInvoiceResponse> getAll(int page, int size);
    PageResponse<SalesInvoiceResponse> search(String search, String status, OffsetDateTime dateFrom, OffsetDateTime dateTo, Integer warehouseId, Integer customerId, int page, int size);
    SalesManagementSummaryResponse summary();
    SalesInvoiceResponse voidInvoice(Integer id, Integer userId);
    void delete(Integer id);
}
