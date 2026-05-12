package com.john.inflow.mapper;

import com.john.inflow.dto.response.WarehouseStockRequestResponse;
import com.john.inflow.entity.WarehouseStockRequest;
import org.springframework.stereotype.Component;

@Component
public class WarehouseStockRequestMapper {
    private final ProductMapper productMapper;
    private final WarehouseMapper warehouseMapper;
    private final UserMapper userMapper;

    public WarehouseStockRequestMapper(ProductMapper productMapper, WarehouseMapper warehouseMapper, UserMapper userMapper) {
        this.productMapper = productMapper;
        this.warehouseMapper = warehouseMapper;
        this.userMapper = userMapper;
    }

    public WarehouseStockRequestResponse toResponse(WarehouseStockRequest request, int availableQuantity) {
        return new WarehouseStockRequestResponse(
                request.getId(),
                productMapper.toSummary(request.getProduct()),
                warehouseMapper.toSummary(request.getSourceWarehouse()),
                warehouseMapper.toSummary(request.getDestinationWarehouse()),
                request.getRequestedQuantity(),
                request.getApprovedQuantity(),
                availableQuantity,
                request.getStatus(),
                request.getReason(),
                request.getNotes(),
                request.getRequesterUser() != null ? userMapper.toSummary(request.getRequesterUser()) : null,
                request.getReviewerUser() != null ? userMapper.toSummary(request.getReviewerUser()) : null,
                request.getReviewerComment(),
                request.getCreatedAt(),
                request.getReviewedAt(),
                request.getCompletedAt(),
                request.getCancelledAt()
        );
    }
}
