package com.john.inflow.repository;

import com.john.inflow.entity.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Integer> {
}
