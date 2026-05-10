package com.john.inflow.repository;

import com.john.inflow.entity.InternalInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InternalInvoiceRepository extends JpaRepository<InternalInvoice, Integer> {
}
