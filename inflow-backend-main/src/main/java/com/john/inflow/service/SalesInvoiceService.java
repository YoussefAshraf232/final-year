package com.john.inflow.service;

import com.john.inflow.dto.request.CreateSalesInvoiceRequest;
import com.john.inflow.dto.response.SalesInvoiceResponse;

import java.util.List;

public interface SalesInvoiceService {
    SalesInvoiceResponse create(CreateSalesInvoiceRequest request, Integer userId);
    SalesInvoiceResponse getById(Integer id);
    List<SalesInvoiceResponse> getAll();
}
