package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CustomerActivityResponse(
    Integer id,
    String reference,
    OffsetDateTime date,
    BigDecimal amount
) {}
