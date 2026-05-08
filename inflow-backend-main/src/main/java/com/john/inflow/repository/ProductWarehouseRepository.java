package com.john.inflow.repository;

import com.john.inflow.entity.ProductWarehouse;
import com.john.inflow.entity.ProductWarehouseId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductWarehouseRepository extends JpaRepository<ProductWarehouse, ProductWarehouseId> {
}
