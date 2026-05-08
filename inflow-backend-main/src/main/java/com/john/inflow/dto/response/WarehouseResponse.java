package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record WarehouseResponse(
    Integer id,
    String address,
    Boolean isCentral,
    OffsetDateTime createdAt
) {}
