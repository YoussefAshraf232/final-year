package com.john.inflow.repository;

import com.john.inflow.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Integer> {
    @Query("""
            SELECT m FROM StockMovement m
            WHERE (:productId IS NULL OR m.product.id = :productId)
              AND (:warehouseId IS NULL OR m.warehouse.id = :warehouseId)
              AND (:movementType IS NULL OR m.movementType = :movementType)
              AND (:dateFrom IS NULL OR m.createdAt >= :dateFrom)
              AND (:dateTo IS NULL OR m.createdAt <= :dateTo)
            ORDER BY m.createdAt DESC
            """)
    Page<StockMovement> search(
            @Param("productId") Integer productId,
            @Param("warehouseId") Integer warehouseId,
            @Param("movementType") String movementType,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable
    );

    Optional<StockMovement> findTopByProductIdAndWarehouseIdOrderByCreatedAtDesc(Integer productId, Integer warehouseId);
}
