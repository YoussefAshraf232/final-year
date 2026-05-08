package com.john.inflow.dto.response;

public record CustomerResponse(
    Integer id,
    String name,
    String phone,
    String address
) {}
