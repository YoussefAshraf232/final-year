package com.john.inflow.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
    Integer id,
    String name,
    String description,
    String pictureUrl,
    BigDecimal currentPrice,
    SupplierResponse supplier,
    List<CategoryResponse> categories
) {}
