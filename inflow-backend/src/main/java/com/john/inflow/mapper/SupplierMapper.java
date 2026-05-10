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
        return supplier;
    }

    public void updateEntity(SupplierRequest request, Supplier supplier) {
        supplier.setName(request.name());
        supplier.setPhone(request.phone());
        supplier.setAddress(request.address());
    }

    public SupplierResponse toResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getPhone(),
                supplier.getAddress()
        );
    }
}
