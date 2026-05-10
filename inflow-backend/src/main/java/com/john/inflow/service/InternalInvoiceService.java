package com.john.inflow.service;

import com.john.inflow.dto.request.CreateInternalInvoiceRequest;
import com.john.inflow.dto.response.InternalInvoiceResponse;

import java.util.List;

public interface InternalInvoiceService {
    InternalInvoiceResponse create(CreateInternalInvoiceRequest request, Integer userId);
    InternalInvoiceResponse getById(Integer id);
    List<InternalInvoiceResponse> getAll();
    void delete(Integer id);
}
