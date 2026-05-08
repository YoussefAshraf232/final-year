package com.john.inflow.service;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;

import java.util.List;

public interface PurchaseInvoiceService {
    PurchaseInvoiceResponse create(CreatePurchaseInvoiceRequest request, Integer userId);
    PurchaseInvoiceResponse getById(Integer id);
    List<PurchaseInvoiceResponse> getAll();
}
