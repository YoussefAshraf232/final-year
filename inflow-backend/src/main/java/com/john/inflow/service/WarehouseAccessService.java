package com.john.inflow.service;

import com.john.inflow.entity.User;
import com.john.inflow.entity.UserWarehouse;
import com.john.inflow.entity.Warehouse;
import com.john.inflow.exception.InvalidOperationException;
import com.john.inflow.repository.UserWarehouseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class WarehouseAccessService {
    private final UserWarehouseRepository userWarehouseRepository;

    public WarehouseAccessService(UserWarehouseRepository userWarehouseRepository) {
        this.userWarehouseRepository = userWarehouseRepository;
    }

    public boolean isSystemAdmin(User user) {
        return hasRole(user, "SYSTEM_ADMIN", "ADMIN");
    }

    public boolean isOperationalManager(User user) {
        return hasRole(user, "OPERATIONAL_MANAGER", "MANAGER");
    }

    public boolean isWarehouseManager(User user) {
        return hasRole(user, "WAREHOUSE_MANAGER", "EMPLOYEE");
    }

    public boolean canAccessAllWarehouses(User user) {
        return isSystemAdmin(user) || isOperationalManager(user);
    }

    public List<Warehouse> getAssignedWarehouses(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }
        return userWarehouseRepository.findActiveByUserIdWithWarehouse(user.getId()).stream()
                .map(UserWarehouse::getWarehouse)
                .toList();
    }

    public Warehouse getPrimaryAssignedWarehouse(User user) {
        List<Warehouse> warehouses = getAssignedWarehouses(user);
        if (warehouses.isEmpty()) {
            throw new InvalidOperationException("No warehouse assigned to this account. Please contact a system administrator.");
        }
        return warehouses.get(0);
    }

    public Integer scopeWarehouseId(User user, Integer requestedWarehouseId) {
        if (canAccessAllWarehouses(user)) {
            return requestedWarehouseId;
        }
        Warehouse assigned = getPrimaryAssignedWarehouse(user);
        if (requestedWarehouseId != null && !assigned.getId().equals(requestedWarehouseId)) {
            throw forbidden("You cannot access this warehouse");
        }
        return assigned.getId();
    }

    public void assertCanAccessWarehouse(User user, Integer warehouseId) {
        if (warehouseId == null || canAccessAllWarehouses(user)) {
            return;
        }
        if (!userWarehouseRepository.existsActiveAssignment(user.getId(), warehouseId)) {
            throw forbidden("You cannot access this warehouse");
        }
    }

    public void assertCanManageWarehouse(User user, Integer warehouseId) {
        assertCanAccessWarehouse(user, warehouseId);
    }

    private boolean hasRole(User user, String... roles) {
        String roleName = user != null && user.getRole() != null ? user.getRole().getName() : null;
        if (roleName == null) {
            return false;
        }
        for (String role : roles) {
            if (role.equals(roleName)) {
                return true;
            }
        }
        return false;
    }

    private ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
