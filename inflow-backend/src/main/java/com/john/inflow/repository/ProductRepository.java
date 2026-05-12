package com.john.inflow.repository;

import com.john.inflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query(
        value = """
            SELECT p.* FROM products p
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            LEFT JOIN (
                SELECT product_id, COALESCE(SUM(amount), 0) AS total
                FROM products_warehouses GROUP BY product_id
            ) sw ON sw.product_id = p.id
            WHERE (CAST(:search AS text) IS NULL
                   OR LOWER(p.name) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(p.sku)  LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(COALESCE(s.name,'')) LIKE LOWER('%' || CAST(:search AS text) || '%'))
              AND (:supplierId IS NULL OR p.supplier_id = :supplierId)
              AND (:categoryId IS NULL OR EXISTS (
                    SELECT 1 FROM categories_products cp
                    WHERE cp.product_id = p.id AND cp.category_id = :categoryId))
              AND (CAST(:status AS text) IS NULL OR p.status = CAST(:status AS text))
              AND (
                  CAST(:stockStatus AS text) IS NULL
                  OR (CAST(:stockStatus AS text) = 'OUT_OF_STOCK' AND COALESCE(sw.total, 0) <= 0)
                  OR (CAST(:stockStatus AS text) = 'LOW_STOCK'
                      AND COALESCE(sw.total, 0) > 0
                      AND COALESCE(sw.total, 0) <= p.reorder_level)
                  OR (CAST(:stockStatus AS text) = 'IN_STOCK'
                      AND COALESCE(sw.total, 0) > p.reorder_level)
              )
            ORDER BY p.id DESC
            """,
        countQuery = """
            SELECT COUNT(p.id) FROM products p
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            LEFT JOIN (
                SELECT product_id, COALESCE(SUM(amount), 0) AS total
                FROM products_warehouses GROUP BY product_id
            ) sw ON sw.product_id = p.id
            WHERE (CAST(:search AS text) IS NULL
                   OR LOWER(p.name) LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(p.sku)  LIKE LOWER('%' || CAST(:search AS text) || '%')
                   OR LOWER(COALESCE(s.name,'')) LIKE LOWER('%' || CAST(:search AS text) || '%'))
              AND (:supplierId IS NULL OR p.supplier_id = :supplierId)
              AND (:categoryId IS NULL OR EXISTS (
                    SELECT 1 FROM categories_products cp
                    WHERE cp.product_id = p.id AND cp.category_id = :categoryId))
              AND (CAST(:status AS text) IS NULL OR p.status = CAST(:status AS text))
              AND (
                  CAST(:stockStatus AS text) IS NULL
                  OR (CAST(:stockStatus AS text) = 'OUT_OF_STOCK' AND COALESCE(sw.total, 0) <= 0)
                  OR (CAST(:stockStatus AS text) = 'LOW_STOCK'
                      AND COALESCE(sw.total, 0) > 0
                      AND COALESCE(sw.total, 0) <= p.reorder_level)
                  OR (CAST(:stockStatus AS text) = 'IN_STOCK'
                      AND COALESCE(sw.total, 0) > p.reorder_level)
              )
            """,
        nativeQuery = true
    )
    Page<Product> search(
            @Param("search") String search,
            @Param("categoryId") Integer categoryId,
            @Param("supplierId") Integer supplierId,
            @Param("stockStatus") String stockStatus,
            @Param("status") String status,
            Pageable pageable
    );

    long countByStatus(String status);

    @Query(value = """
            SELECT COUNT(*) FROM products p
            LEFT JOIN (
                SELECT product_id, COALESCE(SUM(amount), 0) AS total
                FROM products_warehouses GROUP BY product_id
            ) sw ON sw.product_id = p.id
            WHERE COALESCE(sw.total, 0) > 0 AND COALESCE(sw.total, 0) <= p.reorder_level
            """, nativeQuery = true)
    long countLowStock();

    @Query(value = """
            SELECT COUNT(*) FROM products p
            LEFT JOIN (
                SELECT product_id, COALESCE(SUM(amount), 0) AS total
                FROM products_warehouses GROUP BY product_id
            ) sw ON sw.product_id = p.id
            WHERE COALESCE(sw.total, 0) <= 0
            """, nativeQuery = true)
    long countOutOfStock();

    @Query(value = "SELECT COALESCE(SUM(amount), 0) FROM products_warehouses WHERE product_id = :productId",
           nativeQuery = true)
    long totalStockForProduct(@Param("productId") Integer productId);

    boolean existsBySku(String sku);
}
