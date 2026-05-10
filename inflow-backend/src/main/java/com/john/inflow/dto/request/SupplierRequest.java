package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupplierRequest(
    @NotBlank @Size(max = 100) String name,
    @Size(max = 20) String phone,
    @Size(max = 200) String address
) {}
