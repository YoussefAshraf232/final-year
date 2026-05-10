package com.john.inflow.mapper;

import com.john.inflow.dto.request.RoleRequest;
import com.john.inflow.dto.response.RoleResponse;
import com.john.inflow.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public Role toEntity(RoleRequest request) {
        Role role = new Role();
        role.setName(request.name());
        return role;
    }

    public void updateEntity(RoleRequest request, Role role) {
        role.setName(request.name());
    }

    public RoleResponse toResponse(Role role) {
        return new RoleResponse(role.getId(), role.getName());
    }
}
