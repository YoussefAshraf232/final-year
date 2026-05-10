package com.john.inflow.service;

import com.john.inflow.dto.request.CreatePurchaseInvoiceRequest;
import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.PurchaseInvoiceResponse;

public interface PurchaseInvoiceService {
    PurchaseInvoiceResponse create(CreatePurchaseInvoiceRequest request, Integer userId);
    PurchaseInvoiceResponse getById(Integer id);
    PageResponse<PurchaseInvoiceResponse> getAll(int page, int size);
    void delete(Integer id);
}
