package com.john.inflow.dto.request;

import jakarta.validation.constraints.Size;

public record ReviewStockEditRequest(
        @Size(max = 1000) String comment
) {}
