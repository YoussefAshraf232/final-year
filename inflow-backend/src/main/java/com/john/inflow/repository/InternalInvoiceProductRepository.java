package com.john.inflow.repository;

import com.john.inflow.entity.InternalInvoiceProduct;
import com.john.inflow.entity.InternalInvoiceProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InternalInvoiceProductRepository extends JpaRepository<InternalInvoiceProduct, InternalInvoiceProductId> {
}
