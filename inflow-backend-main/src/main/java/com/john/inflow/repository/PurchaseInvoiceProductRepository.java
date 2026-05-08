package com.john.inflow.repository;

import com.john.inflow.entity.PurchaseInvoiceProduct;
import com.john.inflow.entity.PurchaseInvoiceProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseInvoiceProductRepository extends JpaRepository<PurchaseInvoiceProduct, PurchaseInvoiceProductId> {
}
