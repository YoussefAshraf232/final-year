package com.john.inflow.repository;

import com.john.inflow.entity.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
}
