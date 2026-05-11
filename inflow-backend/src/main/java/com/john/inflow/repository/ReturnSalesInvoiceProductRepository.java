package com.john.inflow.repository;

import com.john.inflow.entity.ReturnSalesInvoiceProduct;
import com.john.inflow.entity.ReturnSalesInvoiceProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnSalesInvoiceProductRepository extends JpaRepository<ReturnSalesInvoiceProduct, ReturnSalesInvoiceProductId> {
    @Query("""
            SELECT COALESCE(SUM(i.amount), 0) FROM ReturnSalesInvoiceProduct i
            WHERE i.returnSalesInvoice.salesInvoice.id = :salesInvoiceId
              AND i.product.id = :productId
              AND i.returnSalesInvoice.returnStatus <> 'REJECTED'
            """)
    Integer sumReturnedQuantity(@Param("salesInvoiceId") Integer salesInvoiceId, @Param("productId") Integer productId);
}
