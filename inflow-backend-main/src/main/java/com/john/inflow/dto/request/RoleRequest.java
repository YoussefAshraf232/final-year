package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoleRequest(
    @Size(max=255)
    @NotBlank String name
) {}
