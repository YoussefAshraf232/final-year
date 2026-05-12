package com.john.inflow.dto.response;

public record CustomerSummaryResponse(
    long totalCustomers,
    long activeCustomers,
    long customersWithSales,
    long customersWithReturns
) {}
