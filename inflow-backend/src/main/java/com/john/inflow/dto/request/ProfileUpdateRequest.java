package com.john.inflow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 30) String firstName,
        @Size(max = 30) String lastName,
        @Size(min = 3, max = 20) String phoneNumber,
        @Email @Size(max = 255) String email
) {}
