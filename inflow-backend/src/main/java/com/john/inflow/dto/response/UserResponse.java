package com.john.inflow.dto.response;

import java.time.OffsetDateTime;
import java.util.List;

public record UserResponse(
    Integer id,
    String username,
    String firstName,
    String lastName,
    String phoneNumber,
    String email,
    String roleName,
    OffsetDateTime createdAt,
    OffsetDateTime leftAt,
    WarehouseSummaryResponse assignedWarehouse,
    List<WarehouseSummaryResponse> assignedWarehouses,
    Integer activeWarehouseId
) {}
