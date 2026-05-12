package com.john.inflow.repository;

import com.john.inflow.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    @Query("""
            SELECT c FROM Customer c
            WHERE (:search IS NULL
                OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR c.id = :searchId)
              AND (:status IS NULL OR c.status = :status)
              AND (:createdFrom IS NULL OR c.createdAt >= :createdFrom)
              AND (:createdTo IS NULL OR c.createdAt <= :createdTo)
              AND (:salesActivity IS NULL
                OR (:salesActivity = 'HAS_SALES' AND EXISTS (SELECT s.id FROM SalesInvoice s WHERE s.customer = c))
                OR (:salesActivity = 'NO_SALES' AND NOT EXISTS (SELECT s.id FROM SalesInvoice s WHERE s.customer = c))
                OR (:salesActivity = 'HAS_RETURNS' AND EXISTS (SELECT r.id FROM ReturnSalesInvoice r WHERE r.customer = c)))
            ORDER BY c.createdAt DESC, c.id DESC
            """)
    Page<Customer> search(
            @Param("search") String search,
            @Param("searchId") Integer searchId,
            @Param("status") String status,
            @Param("salesActivity") String salesActivity,
            @Param("createdFrom") OffsetDateTime createdFrom,
            @Param("createdTo") OffsetDateTime createdTo,
            Pageable pageable
    );

    long countByStatus(String status);
}
