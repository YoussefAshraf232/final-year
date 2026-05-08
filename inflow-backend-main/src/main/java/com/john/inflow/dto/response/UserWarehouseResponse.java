package com.john.inflow.dto.response;

import java.time.OffsetDateTime;

public record UserWarehouseResponse(
    UserSummaryResponse user,
    WarehouseSummaryResponse warehouse,
    OffsetDateTime assignedAt,
    OffsetDateTime leftAt
) {}
