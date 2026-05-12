package com.john.inflow.repository;

import com.john.inflow.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    @Query(
        value = """
            SELECT s.* FROM suppliers s
            LEFT JOIN (
                SELECT supplier_id, COUNT(*) AS product_count
                FROM products WHERE supplier_id IS NOT NULL GROUP BY supplier_id
            ) pc ON pc.supplier_id = s.id
            WHERE (CAST(:search AS text) IS NULL
                   OR LOWER(s.name) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(COALESCE(s.email,'')) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(COALESCE(s.contact_person,'')) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR COALESCE(s.phone,'') LIKE '%' || CAST(:search AS text) || '%')
              AND (CAST(:status AS text) IS NULL OR s.status = CAST(:status AS text))
              AND (
                  CAST(:hasProducts AS text) IS NULL
                  OR (CAST(:hasProducts AS text) = 'true' AND COALESCE(pc.product_count, 0) > 0)
                  OR (CAST(:hasProducts AS text) = 'false' AND COALESCE(pc.product_count, 0) = 0)
              )
            ORDER BY s.id ASC
            """,
        countQuery = """
            SELECT COUNT(s.id) FROM suppliers s
            LEFT JOIN (
                SELECT supplier_id, COUNT(*) AS product_count
                FROM products WHERE supplier_id IS NOT NULL GROUP BY supplier_id
            ) pc ON pc.supplier_id = s.id
            WHERE (CAST(:search AS text) IS NULL
                   OR LOWER(s.name) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(COALESCE(s.email,'')) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(COALESCE(s.contact_person,'')) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR COALESCE(s.phone,'') LIKE '%' || CAST(:search AS text) || '%')
              AND (CAST(:status AS text) IS NULL OR s.status = CAST(:status AS text))
              AND (
                  CAST(:hasProducts AS text) IS NULL
                  OR (CAST(:hasProducts AS text) = 'true' AND COALESCE(pc.product_count, 0) > 0)
                  OR (CAST(:hasProducts AS text) = 'false' AND COALESCE(pc.product_count, 0) = 0)
              )
            """,
        nativeQuery = true
    )
    Page<Supplier> search(
            @Param("search") String search,
            @Param("status") String status,
            @Param("hasProducts") String hasProducts,
            Pageable pageable
    );

    long countByStatus(String status);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.supplier IS NOT NULL")
    long countLinkedProducts();

    @Query(value = "SELECT COUNT(*) FROM products WHERE supplier_id = :supplierId", nativeQuery = true)
    long countProductsForSupplier(@Param("supplierId") Integer supplierId);
}
