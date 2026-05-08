package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record ProductSummaryResponse(
    Integer id,
    String name,
    BigDecimal currentPrice
) {}
