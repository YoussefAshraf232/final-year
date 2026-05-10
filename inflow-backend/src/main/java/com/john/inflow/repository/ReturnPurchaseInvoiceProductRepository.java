package com.john.inflow.repository;

import com.john.inflow.entity.ReturnPurchaseInvoiceProduct;
import com.john.inflow.entity.ReturnPurchaseInvoiceProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnPurchaseInvoiceProductRepository extends JpaRepository<ReturnPurchaseInvoiceProduct, ReturnPurchaseInvoiceProductId> {
}
