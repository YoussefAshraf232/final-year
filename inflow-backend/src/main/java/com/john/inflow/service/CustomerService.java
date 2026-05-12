package com.john.inflow.service;

import com.john.inflow.dto.request.CustomerRequest;
import com.john.inflow.dto.response.CustomerDetailResponse;
import com.john.inflow.dto.response.CustomerResponse;
import com.john.inflow.dto.response.CustomerSummaryResponse;
import com.john.inflow.dto.response.PageResponse;

import java.time.LocalDate;

public interface CustomerService {
    CustomerResponse create(CustomerRequest request);
    CustomerDetailResponse getById(Integer id);
    PageResponse<CustomerResponse> getAll(String search, String status, String salesActivity, LocalDate createdFrom, LocalDate createdTo, int page, int size);
    CustomerSummaryResponse getSummary();
    CustomerResponse update(Integer id, CustomerRequest request);
    CustomerResponse deactivate(Integer id);
    void delete(Integer id);
}
