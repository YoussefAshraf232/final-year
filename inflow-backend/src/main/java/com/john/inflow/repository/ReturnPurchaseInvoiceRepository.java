package com.john.inflow.repository;

import com.john.inflow.entity.ReturnPurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ReturnPurchaseInvoiceRepository extends JpaRepository<ReturnPurchaseInvoice, Integer> {
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM ReturnPurchaseInvoice r")
    BigDecimal sumTotalPrice();
}
