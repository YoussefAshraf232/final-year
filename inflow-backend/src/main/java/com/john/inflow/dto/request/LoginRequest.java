package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    String username,
    String email,
    @NotBlank String password
) {}
