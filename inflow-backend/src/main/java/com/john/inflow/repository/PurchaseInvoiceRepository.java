package com.john.inflow.repository;

import com.john.inflow.entity.PurchaseInvoice;
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
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Integer> {
    @Query("SELECT COALESCE(SUM(p.totalPrice), 0) FROM PurchaseInvoice p")
    BigDecimal sumTotalPrice();

    @Query(value = """
            SELECT to_char(months.month, 'YYYY-MM') AS month, COALESCE(SUM(p.total_price), 0) AS total
            FROM generate_series(date_trunc('month', CURRENT_DATE) - interval '11 months',
                                 date_trunc('month', CURRENT_DATE),
                                 interval '1 month') AS months(month)
            LEFT JOIN purchase_invoices p ON date_trunc('month', p.created_at) = months.month
            GROUP BY months.month
            ORDER BY months.month
            """, nativeQuery = true)
    List<Object[]> monthlyTotalsLast12Months();

    @Query("""
            SELECT p FROM PurchaseInvoice p
            WHERE (:search IS NULL
                   OR STR(p.id) LIKE CONCAT('%', :search, '%')
                   OR LOWER(p.supplier.name) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:receiptStatus IS NULL OR p.receiptStatus = :receiptStatus)
              AND (:supplierId IS NULL OR p.supplier.id = :supplierId)
              AND (:warehouseId IS NULL OR p.warehouse.id = :warehouseId)
              AND (:dateFrom IS NULL OR p.createdAt >= :dateFrom)
              AND (:dateTo IS NULL OR p.createdAt <= :dateTo)
            """)
    Page<PurchaseInvoice> search(
            @Param("search") String search,
            @Param("receiptStatus") String receiptStatus,
            @Param("supplierId") Integer supplierId,
            @Param("warehouseId") Integer warehouseId,
            @Param("dateFrom") OffsetDateTime dateFrom,
            @Param("dateTo") OffsetDateTime dateTo,
            Pageable pageable
    );

    long countByReceiptStatus(String receiptStatus);

    @Query("""
            SELECT COUNT(p) FROM PurchaseInvoice p
            WHERE p.receivedAt >= :start AND p.receivedAt < :end
              AND p.receiptStatus = 'RECEIVED'
            """)
    long countReceivedBetween(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

    @Query("""
            SELECT COUNT(DISTINCT pip.purchaseInvoice.id)
            FROM PurchaseInvoiceProduct pip
            WHERE pip.damagedQuantity > 0
              AND pip.purchaseInvoice.receiptStatus <> 'REJECTED'
            """)
    long countOrdersWithDamagedItems();
}
