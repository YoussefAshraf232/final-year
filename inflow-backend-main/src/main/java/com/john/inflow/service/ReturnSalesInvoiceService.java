package com.john.inflow.service;

import com.john.inflow.dto.request.CreateReturnSalesInvoiceRequest;
import com.john.inflow.dto.response.ReturnSalesInvoiceResponse;

import java.util.List;

public interface ReturnSalesInvoiceService {
    ReturnSalesInvoiceResponse create(CreateReturnSalesInvoiceRequest request, Integer userId);
    ReturnSalesInvoiceResponse getById(Integer id);
    List<ReturnSalesInvoiceResponse> getAll();
}
