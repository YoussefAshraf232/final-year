package com.john.inflow.service;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;
import com.john.inflow.dto.response.ReturnSalesSummaryResponse;

import java.time.OffsetDateTime;
import java.util.List;

public interface ReturnSalesInvoiceService {
    ReturnSalesInvoiceResponse create(CreateReturnSalesInvoiceRequest request, Integer userId);
    ReturnSalesInvoiceResponse getById(Integer id);
    List<ReturnSalesInvoiceResponse> getAll();
    PageResponse<ReturnSalesInvoiceResponse> search(String search, String returnStatus, String restockStatus, String refundStatus, OffsetDateTime dateFrom, OffsetDateTime dateTo, Integer warehouseId, Integer customerId, int page, int size);
    ReturnSalesSummaryResponse summary();
    ReturnSalesInvoiceResponse approve(Integer id, Integer userId);
    ReturnSalesInvoiceResponse reject(Integer id, Integer userId);
    ReturnSalesInvoiceResponse restock(Integer id, Integer userId);
    ReturnSalesInvoiceResponse refund(Integer id, Integer userId);
    void delete(Integer id);
}
