package com.john.inflow.service;

import com.john.inflow.dto.request.CustomerRequest;
import com.john.inflow.dto.response.CustomerResponse;

import java.util.List;

public interface CustomerService {
    CustomerResponse create(CustomerRequest request);
    CustomerResponse getById(Integer id);
    List<CustomerResponse> getAll();
    CustomerResponse update(Integer id, CustomerRequest request);
    void delete(Integer id);
}
