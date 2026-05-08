package com.john.inflow.mapper;

import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.WarehouseResponse;
import com.john.inflow.dto.response.WarehouseSummaryResponse;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

@Component
public class WarehouseMapper {

    public Warehouse toEntity(WarehouseRequest request) {
        Warehouse warehouse = new Warehouse();
        warehouse.setAddress(request.address());
        warehouse.setIsCentral(request.isCentral());
        return warehouse;
    }

    public void updateEntity(WarehouseRequest request, Warehouse warehouse) {
        warehouse.setAddress(request.address());
        warehouse.setIsCentral(request.isCentral());
    }

    public WarehouseResponse toResponse(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getAddress(),
                warehouse.getIsCentral(),
                warehouse.getCreatedAt()
        );
    }

    public WarehouseSummaryResponse toSummary(Warehouse warehouse) {
        return new WarehouseSummaryResponse(
                warehouse.getId(),
                warehouse.getAddress()
        );
    }
}
