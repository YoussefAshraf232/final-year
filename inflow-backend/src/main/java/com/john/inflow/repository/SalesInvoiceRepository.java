package com.john.inflow.repository;

import com.john.inflow.entity.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
}
