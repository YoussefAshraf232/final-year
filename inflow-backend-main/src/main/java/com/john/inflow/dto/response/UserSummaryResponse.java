package com.john.inflow.dto.response;

public record UserSummaryResponse(
    Integer id,
    String username,
    String firstName,
    String lastName
) {}
