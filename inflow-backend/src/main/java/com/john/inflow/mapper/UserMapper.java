package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateUserRequest;
import com.john.inflow.dto.request.UpdateUserRequest;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.dto.response.UserSummaryResponse;
import com.john.inflow.dto.response.WarehouseSummaryResponse;
import com.john.inflow.entity.Role;
import com.john.inflow.entity.User;
import com.john.inflow.repository.UserWarehouseRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserMapper {
    private final RoleMapper roleMapper;
    private final UserWarehouseRepository userWarehouseRepository;

    public UserMapper(RoleMapper roleMapper, UserWarehouseRepository userWarehouseRepository) {
        this.roleMapper = roleMapper;
        this.userWarehouseRepository = userWarehouseRepository;
    }

    public User toEntity(CreateUserRequest request, String passwordHash, Role role) {
        User user = new User();
        user.setUsername(request.username());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhoneNumber(request.phoneNumber());
        user.setEmail(request.email());
        user.setPasswordHash(passwordHash);
        user.setRole(role);
        return user;
    }

    public void updateEntity(UpdateUserRequest request, User user) {
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
    }

    public UserResponse toResponse(User user) {
        List<WarehouseSummaryResponse> assignedWarehouses = userWarehouseRepository
                .findActiveByUserIdWithWarehouse(user.getId())
                .stream()
                .map(uw -> new WarehouseSummaryResponse(uw.getWarehouse().getId(), uw.getWarehouse().getAddress()))
                .toList();
        WarehouseSummaryResponse assignedWarehouse = assignedWarehouses.isEmpty() ? null : assignedWarehouses.get(0);
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : null,
                user.getCreatedAt(),
                user.getLeftAt(),
                assignedWarehouse,
                assignedWarehouses,
                assignedWarehouse != null ? assignedWarehouse.id() : null
        );
    }

    public UserSummaryResponse toSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
