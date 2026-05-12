package com.john.inflow.mapper;

import com.john.inflow.dto.request.WarehouseRequest;
import com.john.inflow.dto.response.UserSummaryResponse;
import com.john.inflow.dto.response.WarehouseResponse;
import com.john.inflow.dto.response.WarehouseSummaryResponse;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

@Component
public class WarehouseMapper {

    public Warehouse toEntity(WarehouseRequest request) {
        Warehouse warehouse = new Warehouse();
        warehouse.setAddress(request.address());
        warehouse.setIsCentral(request.isCentral() != null ? request.isCentral() : Boolean.FALSE);
        warehouse.setStatus(request.status() != null ? request.status() : "ACTIVE");
        warehouse.setPhone(request.phone());
        warehouse.setNotes(request.notes());
        return warehouse;
    }

    public void updateEntity(WarehouseRequest request, Warehouse warehouse) {
        warehouse.setAddress(request.address());
        if (request.isCentral() != null) warehouse.setIsCentral(request.isCentral());
        if (request.status() != null) warehouse.setStatus(request.status());
        warehouse.setPhone(request.phone());
        warehouse.setNotes(request.notes());
    }

    public WarehouseResponse toResponse(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getAddress(),
                warehouse.getIsCentral(),
                warehouse.getStatus(),
                warehouse.getPhone(),
                warehouse.getNotes(),
                null,
                null,
                null,
                null,
                warehouse.getCreatedAt(),
                warehouse.getDeactivatedAt()
        );
    }

    public WarehouseResponse toResponseDetailed(Warehouse warehouse, UserSummaryResponse manager,
                                                Integer productsCount, Integer totalStock, Integer lowStockItems) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getAddress(),
                warehouse.getIsCentral(),
                warehouse.getStatus(),
                warehouse.getPhone(),
                warehouse.getNotes(),
                manager,
                productsCount,
                totalStock,
                lowStockItems,
                warehouse.getCreatedAt(),
                warehouse.getDeactivatedAt()
        );
    }

    public WarehouseSummaryResponse toSummary(Warehouse warehouse) {
        return new WarehouseSummaryResponse(
                warehouse.getId(),
                warehouse.getAddress()
        );
    }
}
