package com.john.inflow.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RejectOrderRequest(
        @NotBlank String reason,
        String notes
) {}
