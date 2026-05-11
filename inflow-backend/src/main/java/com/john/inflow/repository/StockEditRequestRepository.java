package com.john.inflow.repository;

import com.john.inflow.entity.StockEditRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface StockEditRequestRepository extends JpaRepository<StockEditRequest, Integer> {

    @Query(
        value = """
            SELECT r.* FROM stock_edit_requests r
            JOIN products p ON p.id = r.product_id
            JOIN warehouses w ON w.id = r.warehouse_id
            WHERE (CAST(:search AS text) IS NULL
                   OR r.id::text LIKE '%' || CAST(:search AS text) || '%'
                   OR LOWER(p.name) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(w.address) LIKE LOWER('%' || CAST(:search AS text) || '%'))
              AND (CAST(:status AS text) IS NULL OR r.status = CAST(:status AS text))
              AND (:productId IS NULL OR r.product_id = :productId)
              AND (:warehouseId IS NULL OR r.warehouse_id = :warehouseId)
              AND (CAST(:dateFrom AS timestamptz) IS NULL OR r.created_at >= CAST(:dateFrom AS timestamptz))
              AND (CAST(:dateTo AS timestamptz) IS NULL OR r.created_at <= CAST(:dateTo AS timestamptz))
            ORDER BY r.created_at DESC
            """,
        countQuery = """
            SELECT COUNT(r.id) FROM stock_edit_requests r
            JOIN products p ON p.id = r.product_id
            JOIN warehouses w ON w.id = r.warehouse_id
            WHERE (CAST(:search AS text) IS NULL
                   OR r.id::text LIKE '%' || CAST(:search AS text) || '%'
                   OR LOWER(p.name) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(w.address) LIKE LOWER('%' || CAST(:search AS text) || '%'))
              AND (CAST(:status AS text) IS NULL OR r.status = CAST(:status AS text))
              AND (:productId IS NULL OR r.product_id = :productId)
              AND (:warehouseId IS NULL OR r.warehouse_id = :warehouseId)
              AND (CAST(:dateFrom AS timestamptz) IS NULL OR r.created_at >= CAST(:dateFrom AS timestamptz))
              AND (CAST(:dateTo AS timestamptz) IS NULL OR r.created_at <= CAST(:dateTo AS timestamptz))
            """,
        nativeQuery = true
    )
    Page<StockEditRequest> search(
            @Param("search") String search,
            @Param("status") String status,
            @Param("productId") Integer productId,
            @Param("warehouseId") Integer warehouseId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable
    );

    long countByStatus(String status);

    @Query("""
            SELECT COUNT(r) FROM StockEditRequest r
            WHERE r.status = 'APPROVED'
              AND r.reviewedAt >= :start
              AND r.reviewedAt < :end
            """)
    long countApprovedBetween(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);
}
