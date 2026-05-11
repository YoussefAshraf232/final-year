package com.john.inflow.repository;

import com.john.inflow.entity.ReturnSalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Repository
public interface ReturnSalesInvoiceRepository extends JpaRepository<ReturnSalesInvoice, Integer> {
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM ReturnSalesInvoice r")
    BigDecimal sumTotalPrice();

    @Query("""
            SELECT r FROM ReturnSalesInvoice r
            WHERE (:search IS NULL OR LOWER(r.customer.name) LIKE LOWER(CONCAT('%', :search, '%')) OR r.id = :searchId OR r.salesInvoice.id = :searchId)
              AND (:returnStatus IS NULL OR r.returnStatus = :returnStatus)
              AND (:restockStatus IS NULL OR r.restockStatus = :restockStatus)
              AND (:refundStatus IS NULL OR r.refundStatus = :refundStatus)
              AND (:warehouseId IS NULL OR r.warehouse.id = :warehouseId)
              AND (:customerId IS NULL OR r.customer.id = :customerId)
              AND r.returnedAt >= :dateFrom
              AND r.returnedAt <= :dateTo
            ORDER BY r.returnedAt DESC
            """)
    Page<ReturnSalesInvoice> search(
            @Param("search") String search,
            @Param("searchId") Integer searchId,
            @Param("returnStatus") String returnStatus,
            @Param("restockStatus") String restockStatus,
            @Param("refundStatus") String refundStatus,
            @Param("warehouseId") Integer warehouseId,
            @Param("customerId") Integer customerId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable);

    @Query("""
            SELECT r FROM ReturnSalesInvoice r
            WHERE (:returnStatus IS NULL OR r.returnStatus = :returnStatus)
              AND (:restockStatus IS NULL OR r.restockStatus = :restockStatus)
              AND (:refundStatus IS NULL OR r.refundStatus = :refundStatus)
              AND (:warehouseId IS NULL OR r.warehouse.id = :warehouseId)
              AND (:customerId IS NULL OR r.customer.id = :customerId)
              AND r.returnedAt >= :dateFrom
              AND r.returnedAt <= :dateTo
            ORDER BY r.returnedAt DESC
            """)
    Page<ReturnSalesInvoice> searchWithoutText(
            @Param("returnStatus") String returnStatus,
            @Param("restockStatus") String restockStatus,
            @Param("refundStatus") String refundStatus,
            @Param("warehouseId") Integer warehouseId,
            @Param("customerId") Integer customerId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM ReturnSalesInvoice r WHERE r.returnedAt >= :start AND r.returnedAt < :end")
    BigDecimal sumToday(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM ReturnSalesInvoice r WHERE r.refundStatus IN ('REFUNDED', 'CREDIT_ISSUED')")
    BigDecimal sumRefunded();

    long countByReturnStatus(String returnStatus);

    long countByRestockStatus(String restockStatus);

    boolean existsBySalesInvoiceId(Integer salesInvoiceId);
}
