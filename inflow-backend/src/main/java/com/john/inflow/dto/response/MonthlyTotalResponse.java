package com.john.inflow.dto.response;

import java.math.BigDecimal;

public record MonthlyTotalResponse(
        String month,
        BigDecimal total
) {}
