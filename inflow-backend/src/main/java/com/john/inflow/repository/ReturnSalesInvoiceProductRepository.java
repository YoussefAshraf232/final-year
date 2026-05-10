package com.john.inflow.repository;

import com.john.inflow.entity.ReturnSalesInvoiceProduct;
import com.john.inflow.entity.ReturnSalesInvoiceProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnSalesInvoiceProductRepository extends JpaRepository<ReturnSalesInvoiceProduct, ReturnSalesInvoiceProductId> {
}
