package com.john.inflow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateUserRequest(
    @Size(min = 3, max = 30) String username,
    @Size(max = 30) String firstName,
    @Size(max = 30) String lastName,
    @Size(max = 20) String phoneNumber,
    @Email @Size(max = 255) String email,
    @Size(min = 8, max = 255) String password,
    Integer roleId,
    List<Integer> warehouseIds
) {}
