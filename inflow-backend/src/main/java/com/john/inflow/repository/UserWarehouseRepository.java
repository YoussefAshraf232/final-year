package com.john.inflow.repository;

import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.UserWarehouseId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserWarehouseRepository extends JpaRepository<UserWarehouse, UserWarehouseId> {
    List<UserWarehouse> findByWarehouseIdAndLeftAtIsNull(Integer warehouseId);

    @Query("""
            SELECT uw FROM UserWarehouse uw
            WHERE uw.user.id = :userId
              AND uw.leftAt IS NULL
            """)
    List<UserWarehouse> findActiveByUserId(@Param("userId") Integer userId);

    @Query("""
            SELECT COUNT(uw) > 0 FROM UserWarehouse uw
            WHERE uw.user.id = :userId
              AND uw.warehouse.id = :warehouseId
              AND uw.leftAt IS NULL
            """)
    boolean existsActiveAssignment(@Param("userId") Integer userId, @Param("warehouseId") Integer warehouseId);

    @Query("""
            SELECT uw FROM UserWarehouse uw
            JOIN FETCH uw.warehouse
            WHERE uw.user.id = :userId
              AND uw.leftAt IS NULL
            ORDER BY uw.id.assignedAt ASC
            """)
    List<UserWarehouse> findActiveByUserIdWithWarehouse(@Param("userId") Integer userId);
}
