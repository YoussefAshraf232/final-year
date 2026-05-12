package com.john.inflow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 20) String phone,
    @Email @Size(max = 255) String email,
    @Size(max = 200) String address,
    @Size(max = 20) String status,
    @Size(max = 2000) String notes
) {}
