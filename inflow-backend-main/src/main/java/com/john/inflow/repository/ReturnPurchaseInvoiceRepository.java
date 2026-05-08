package com.john.inflow.repository;

import com.john.inflow.entity.ReturnPurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnPurchaseInvoiceRepository extends JpaRepository<ReturnPurchaseInvoice, Integer> {
}
