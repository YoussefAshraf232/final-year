package com.john.inflow.mapper;

import com.john.inflow.dto.request.CustomerRequest;
import com.john.inflow.dto.response.CustomerResponse;
import com.john.inflow.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toEntity(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setAddress(request.address());
        return customer;
    }

    public void updateEntity(CustomerRequest request, Customer customer) {
        customer.setName(request.name());
        customer.setPhone(request.phone());
        customer.setAddress(request.address());
    }

    public CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getAddress()
        );
    }
}
