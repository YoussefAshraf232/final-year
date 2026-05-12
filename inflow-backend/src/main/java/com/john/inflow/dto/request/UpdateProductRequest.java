package com.john.inflow.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
    @Size(max = 255) String name,
    @Size(max = 50) String sku,
    String description,
    String pictureUrl,
    @DecimalMin("0.0") BigDecimal currentPrice,
    @DecimalMin("0.0") BigDecimal costPrice,
    @Min(0) Integer reorderLevel,
    @Pattern(regexp = "ACTIVE|INACTIVE|DISCONTINUED") String status,
    Integer supplierId,
    List<Integer> categoryIds
) {}
