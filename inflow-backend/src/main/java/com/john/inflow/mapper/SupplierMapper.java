package com.john.inflow.mapper;

import com.john.inflow.dto.request.SupplierRequest;
import com.john.inflow.dto.response.SupplierResponse;
import com.john.inflow.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public Supplier toEntity(SupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.name());
        supplier.setPhone(request.phone());
        supplier.setAddress(request.address());
        supplier.setEmail(request.email());
        supplier.setContactPerson(request.contactPerson());
        supplier.setStatus(request.status() != null ? request.status() : "ACTIVE");
        supplier.setNotes(request.notes());
        return supplier;
    }

    public void updateEntity(SupplierRequest request, Supplier supplier) {
        supplier.setName(request.name());
        supplier.setPhone(request.phone());
        supplier.setAddress(request.address());
        supplier.setEmail(request.email());
        supplier.setContactPerson(request.contactPerson());
        if (request.status() != null) supplier.setStatus(request.status());
        supplier.setNotes(request.notes());
    }

    public SupplierResponse toResponse(Supplier supplier) {
        return toResponse(supplier, 0L);
    }

    public SupplierResponse toResponse(Supplier supplier, long productsCount) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getPhone(),
                supplier.getAddress(),
                supplier.getEmail(),
                supplier.getContactPerson(),
                supplier.getStatus(),
                supplier.getNotes(),
                productsCount,
                supplier.getCreatedAt(),
                supplier.getUpdatedAt()
        );
    }
}
