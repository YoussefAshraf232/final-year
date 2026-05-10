package com.john.inflow.service;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.SalesInvoiceResponse;

public interface SalesInvoiceService {
    SalesInvoiceResponse create(CreateSalesInvoiceRequest request, Integer userId);
    SalesInvoiceResponse getById(Integer id);
    PageResponse<SalesInvoiceResponse> getAll(int page, int size);
    void delete(Integer id);
}
