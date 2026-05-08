package com.john.inflow.mapper;

import com.john.inflow.dto.request.CreateUserRequest;
import com.john.inflow.dto.request.UpdateUserRequest;
import com.john.inflow.dto.response.UserResponse;
import com.john.inflow.dto.response.UserSummaryResponse;
import com.john.inflow.entity.Role;
import com.john.inflow.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    private final RoleMapper roleMapper;

    public UserMapper(RoleMapper roleMapper) {
        this.roleMapper = roleMapper;
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
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getRole() != null ? roleMapper.toResponse(user.getRole()) : null,
                user.getCreatedAt(),
                user.getLeftAt()
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
