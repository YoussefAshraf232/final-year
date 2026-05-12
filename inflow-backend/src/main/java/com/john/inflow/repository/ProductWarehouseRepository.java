package com.john.inflow.repository;

import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductWarehouseRepository extends JpaRepository<ProductWarehouse, ProductWarehouseId> {
    @Query("SELECT pw FROM ProductWarehouse pw JOIN FETCH pw.product p JOIN FETCH pw.warehouse w")
    List<ProductWarehouse> findAllWithProductAndWarehouse();

    List<ProductWarehouse> findByWarehouseId(Integer warehouseId);

    @Query("SELECT COUNT(pw) FROM ProductWarehouse pw WHERE pw.amount <= :threshold")
    long countLowStock(@Param("threshold") int threshold);

    @Query("SELECT pw FROM ProductWarehouse pw JOIN FETCH pw.product JOIN FETCH pw.warehouse WHERE pw.amount <= :threshold")
    List<ProductWarehouse> findLowStock(@Param("threshold") int threshold);
}
