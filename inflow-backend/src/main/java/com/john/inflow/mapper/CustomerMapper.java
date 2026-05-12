package com.john.inflow.mapper;

import com.john.inflow.dto.request.CustomerRequest;
import com.john.inflow.dto.response.CustomerResponse;
import com.john.inflow.entity.Customer;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Locale;

@Component
public class CustomerMapper {
    public Customer toEntity(CustomerRequest request) {
        Customer customer = new Customer();
        updateEntity(request, customer);
        if (customer.getStatus() == null || customer.getStatus().isBlank()) {
            customer.setStatus("ACTIVE");
        }
        return customer;
    }

    public void updateEntity(CustomerRequest request, Customer customer) {
        customer.setName(request.name());
        customer.setPhone(blankToNull(request.phone()));
        customer.setEmail(blankToNull(request.email()));
        customer.setAddress(blankToNull(request.address()));
        customer.setNotes(blankToNull(request.notes()));
        String nextStatus = normalizeStatus(request.status());
        if (nextStatus != null) {
            customer.setStatus(nextStatus);
            customer.setDeactivatedAt(nextStatus.equals("INACTIVE") ? OffsetDateTime.now() : null);
        }
    }

    public CustomerResponse toResponse(Customer customer, BigDecimal totalSales, long returnsCount) {
        return new CustomerResponse(
                customer.getId(),
                customerId(customer.getId()),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getStatus(),
                customer.getNotes(),
                totalSales == null ? BigDecimal.ZERO : totalSales,
                returnsCount,
                customer.getCreatedAt(),
                customer.getDeactivatedAt()
        );
    }

    public CustomerResponse toResponse(Customer customer) {
        return toResponse(customer, BigDecimal.ZERO, 0);
    }

    public String customerId(Integer id) {
        return "CUS-" + String.format("%04d", id == null ? 0 : id);
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return null;
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        return normalized.equals("INACTIVE") ? "INACTIVE" : "ACTIVE";
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
