package com.john.inflow.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
    @NotBlank @Size(max = 255) String name,
    String description,
    String pictureUrl,
    @NotNull @DecimalMin("0.0") BigDecimal currentPrice,
    Integer supplierId,
    List<Integer> categoryIds
) {}
