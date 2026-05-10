package com.john.inflow.repository;

import com.john.inflow.entity.ReturnSalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface ReturnSalesInvoiceRepository extends JpaRepository<ReturnSalesInvoice, Integer> {
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM ReturnSalesInvoice r")
    BigDecimal sumTotalPrice();
}
