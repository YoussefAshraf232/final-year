package com.john.inflow.mapper;

import com.john.inflow.dto.request.AssignUserWarehouseRequest;
import com.john.inflow.dto.response.UserWarehouseResponse;
import com.john.inflow.entity.User;
import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.UserWarehouseId;
import com.john.inflow.entity.Warehouse;
import org.springframework.stereotype.Component;

@Component
public class UserWarehouseMapper {

    private final UserMapper userMapper;
    private final WarehouseMapper warehouseMapper;

    public UserWarehouseMapper(UserMapper userMapper, WarehouseMapper warehouseMapper) {
        this.userMapper = userMapper;
        this.warehouseMapper = warehouseMapper;
    }

    public UserWarehouse toEntity(AssignUserWarehouseRequest request, User user, Warehouse warehouse) {
        UserWarehouse userWarehouse = new UserWarehouse();
        userWarehouse.setId(new UserWarehouseId());
        userWarehouse.setUser(user);
        userWarehouse.setWarehouse(warehouse);
        userWarehouse.setLeftAt(null);
        return userWarehouse;
    }

    public UserWarehouseResponse toResponse(UserWarehouse userWarehouse) {
        return new UserWarehouseResponse(
                userWarehouse.getUser() != null ? userMapper.toSummary(userWarehouse.getUser()) : null,
                userWarehouse.getWarehouse() != null ? warehouseMapper.toSummary(userWarehouse.getWarehouse()) : null,
                userWarehouse.getId() != null ? userWarehouse.getId().getAssignedAt() : null,
                userWarehouse.getLeftAt()
        );
    }
}
