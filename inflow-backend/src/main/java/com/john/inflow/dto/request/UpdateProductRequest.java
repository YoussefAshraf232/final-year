package com.john.inflow.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
    @Size(max = 255) String name,
    String description,
    String pictureUrl,
    @DecimalMin("0.0") BigDecimal currentPrice,
    Integer supplierId,
    List<Integer> categoryIds
) {}
