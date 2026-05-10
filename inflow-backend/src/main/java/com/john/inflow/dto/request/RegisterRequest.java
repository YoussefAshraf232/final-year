package com.john.inflow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(max = 30) String username,
    @Size(max = 30) String firstName,
    @Size(max = 30) String lastName,
    @Size(max = 20) String phoneNumber,
    @NotBlank @Email @Size(max = 255) String email,
    @NotBlank String password
) {}
