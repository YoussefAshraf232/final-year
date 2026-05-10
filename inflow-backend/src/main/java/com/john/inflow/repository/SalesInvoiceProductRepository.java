package com.john.inflow.repository;

import com.john.inflow.entity.SalesInvoiceProduct;
import com.john.inflow.entity.SalesInvoiceProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesInvoiceProductRepository extends JpaRepository<SalesInvoiceProduct, SalesInvoiceProductId> {
}
