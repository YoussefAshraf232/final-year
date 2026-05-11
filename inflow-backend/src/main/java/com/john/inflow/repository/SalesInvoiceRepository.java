package com.john.inflow.repository;

import com.john.inflow.entity.SalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Integer> {
    @Query("SELECT COALESCE(SUM(s.totalPrice), 0) FROM SalesInvoice s")
    BigDecimal sumTotalPrice();

    @Query("SELECT c.id, c.name, COALESCE(SUM(s.totalPrice), 0) FROM Customer c LEFT JOIN c.salesInvoices s GROUP BY c.id, c.name")
    List<Object[]> getCustomerPurchaseHistoryRaw();

    @Query(value = """
            SELECT to_char(months.month, 'YYYY-MM') AS month, COALESCE(SUM(s.total_price), 0) AS total
            FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '11 months',
                                 date_trunc('month', CURRENT_DATE),
                                 interval '1 month') AS months(month)
            LEFT JOIN sales_invoices s ON date_trunc('month', s.created_at) = months.month
            GROUP BY months.month
            ORDER BY months.month
            """, nativeQuery = true)
    List<Object[]> monthlyTotalsLast12Months();

    @Query("""
            SELECT s FROM SalesInvoice s
            WHERE (:search IS NULL OR LOWER(s.customer.name) LIKE LOWER(CONCAT('%', :search, '%')) OR s.id = :searchId)
              AND (:status IS NULL OR s.status = :status)
              AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId)
              AND (:customerId IS NULL OR s.customer.id = :customerId)
              AND s.createdAt >= :dateFrom
              AND s.createdAt <= :dateTo
            ORDER BY s.createdAt DESC
            """)
    Page<SalesInvoice> search(
            @Param("search") String search,
            @Param("searchId") Integer searchId,
            @Param("status") String status,
            @Param("warehouseId") Integer warehouseId,
            @Param("customerId") Integer customerId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable);

    @Query("""
            SELECT s FROM SalesInvoice s
            WHERE (:status IS NULL OR s.status = :status)
              AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId)
              AND (:customerId IS NULL OR s.customer.id = :customerId)
              AND s.createdAt >= :dateFrom
              AND s.createdAt <= :dateTo
            ORDER BY s.createdAt DESC
            """)
    Page<SalesInvoice> searchWithoutText(
            @Param("status") String status,
            @Param("warehouseId") Integer warehouseId,
            @Param("customerId") Integer customerId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.totalPrice), 0) FROM SalesInvoice s WHERE s.createdAt >= :start AND s.createdAt < :end AND s.status <> 'CANCELLED'")
    BigDecimal sumToday(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    long countByStatus(String status);
}
