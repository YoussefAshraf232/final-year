package com.john.inflow.repository;

import com.john.inflow.entity.ReturnSalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnSalesInvoiceRepository extends JpaRepository<ReturnSalesInvoice, Integer> {
}
