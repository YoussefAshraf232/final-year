package com.john.inflow.mapper;

import com.john.inflow.dto.response.StockEditRequestResponse;
import com.john.inflow.entity.StockEditRequest;
import org.springframework.stereotype.Component;

@Component
public class StockEditRequestMapper {
    private final ProductMapper productMapper;
    private final WarehouseMapper warehouseMapper;
    private final UserMapper userMapper;

    public StockEditRequestMapper(ProductMapper productMapper, WarehouseMapper warehouseMapper, UserMapper userMapper) {
        this.productMapper = productMapper;
        this.warehouseMapper = warehouseMapper;
        this.userMapper = userMapper;
    }

    public StockEditRequestResponse toResponse(StockEditRequest r) {
        return new StockEditRequestResponse(
                r.getId(),
                r.getProduct() != null ? productMapper.toSummary(r.getProduct()) : null,
                r.getWarehouse() != null ? warehouseMapper.toSummary(r.getWarehouse()) : null,
                r.getCurrentQuantity(),
                r.getRequestedQuantity(),
                r.getDifferenceQuantity(),
                r.getReason(),
                r.getNotes(),
                r.getStatus(),
                r.getRequestedByUser() != null ? userMapper.toSummary(r.getRequestedByUser()) : null,
                r.getReviewedByUser() != null ? userMapper.toSummary(r.getReviewedByUser()) : null,
                r.getReviewComment(),
                r.getCreatedAt(),
                r.getReviewedAt(),
                r.getCancelledAt()
        );
    }
}
