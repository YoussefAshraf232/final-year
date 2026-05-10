package com.john.inflow.service;

import com.john.inflow.dto.response.PageResponse;
import com.john.inflow.dto.response.StockMovementResponse;
import com.john.inflow.entity.Product;
import com.john.inflow.entity.StockMovement;
import com.john.inflow.entity.User;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.repository.StockMovementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
public class StockMovementService {
    private final StockMovementRepository stockMovementRepository;

    public StockMovementService(StockMovementRepository stockMovementRepository) {
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<StockMovementResponse> getAll(Integer productId, Integer warehouseId, String movementType, OffsetDateTime dateFrom, OffsetDateTime dateTo, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.of(stockMovementRepository.search(productId, warehouseId, movementType, dateFrom, dateTo, pageable).map(this::toResponse));
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void record(Product product, Warehouse warehouse, String movementType, int quantity, BigDecimal unitCost, String referenceType, Integer referenceId, String note, User actor) {
        BigDecimal totalValue = unitCost != null ? unitCost.multiply(BigDecimal.valueOf(Math.abs(quantity))) : null;
        StockMovement movement = StockMovement.builder()
                .product(product)
                .warehouse(warehouse)
                .movementType(movementType)
                .quantity(quantity)
                .unitCost(unitCost)
                .totalValue(totalValue)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .note(note)
                .actorUser(actor)
                .build();
        stockMovementRepository.save(movement);
    }

    private StockMovementResponse toResponse(StockMovement movement) {
        Product product = movement.getProduct();
        Warehouse warehouse = movement.getWarehouse();
        User actor = movement.getActorUser();
        return new StockMovementResponse(
                movement.getId(),
                product.getId(),
                product.getName(),
                warehouse.getId(),
                warehouse.getAddress(),
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getUnitCost(),
                movement.getTotalValue(),
                movement.getReferenceType(),
                movement.getReferenceId(),
                movement.getNote(),
                actor != null ? actor.getId() : null,
                actor != null ? actor.getUsername() : null,
                movement.getCreatedAt()
        );
    }
}
