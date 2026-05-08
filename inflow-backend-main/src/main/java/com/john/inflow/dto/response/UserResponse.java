package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record UserResponse(
    Integer id,
    String username,
    String firstName,
    String lastName,
    String phoneNumber,
    String email,
    RoleResponse role,
    OffsetDateTime createdAt,
    OffsetDateTime leftAt
) {}
