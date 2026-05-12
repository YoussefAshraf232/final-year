package com.john.inflow.repository;

import com.john.inflow.entity.WarehouseStockRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface WarehouseStockRequestRepository extends JpaRepository<WarehouseStockRequest, Integer> {
    @Query("""
            SELECT r FROM WarehouseStockRequest r
            WHERE (:requesterUserId IS NULL OR r.requesterUser.id = :requesterUserId)
              AND (:sourceWarehouseId IS NULL OR r.sourceWarehouse.id = :sourceWarehouseId)
              AND (:destinationWarehouseId IS NULL OR r.destinationWarehouse.id = :destinationWarehouseId)
              AND (:status IS NULL OR r.status = :status)
            ORDER BY r.createdAt DESC
            """)
    Page<WarehouseStockRequest> search(
            @Param("requesterUserId") Integer requesterUserId,
            @Param("sourceWarehouseId") Integer sourceWarehouseId,
            @Param("destinationWarehouseId") Integer destinationWarehouseId,
            @Param("status") String status,
            Pageable pageable
    );

    long countByRequesterUserIdAndStatus(Integer requesterUserId, String status);

    long countBySourceWarehouseIdAndStatus(Integer sourceWarehouseId, String status);

    long countByStatus(String status);

    @Query("""
            SELECT COUNT(r) FROM WarehouseStockRequest r
            WHERE r.status = 'COMPLETED'
              AND (:warehouseId IS NULL OR r.sourceWarehouse.id = :warehouseId OR r.destinationWarehouse.id = :warehouseId)
              AND r.completedAt >= :start
              AND r.completedAt < :end
            """)
    long countCompletedBetween(@Param("warehouseId") Integer warehouseId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("""
            SELECT COUNT(r) FROM WarehouseStockRequest r
            WHERE r.status = 'REJECTED'
              AND (:warehouseId IS NULL OR r.sourceWarehouse.id = :warehouseId OR r.destinationWarehouse.id = :warehouseId)
            """)
    long countRejectedForWarehouse(@Param("warehouseId") Integer warehouseId);
}
