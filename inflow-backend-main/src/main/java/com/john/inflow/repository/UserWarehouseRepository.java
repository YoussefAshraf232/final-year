package com.john.inflow.repository;

import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.UserWarehouseId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserWarehouseRepository extends JpaRepository<UserWarehouse, UserWarehouseId> {
}
