package com.john.inflow.service;

import com.john.inflow.dto.request.CreateReturnPurchaseInvoiceRequest;
import com.john.inflow.dto.response.ReturnPurchaseInvoiceResponse;

import java.util.List;

public interface ReturnPurchaseInvoiceService {
    ReturnPurchaseInvoiceResponse create(CreateReturnPurchaseInvoiceRequest request, Integer userId);
    ReturnPurchaseInvoiceResponse getById(Integer id);
    List<ReturnPurchaseInvoiceResponse> getAll();
}
