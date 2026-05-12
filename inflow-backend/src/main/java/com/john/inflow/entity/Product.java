package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(nullable = false)
    @Size(max = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "picture_url", columnDefinition = "TEXT")
    private String pictureUrl;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "current_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @DecimalMin("0.0")
    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @NotNull
    @Min(0)
    @Column(name = "reorder_level", nullable = false)
    @Builder.Default
    private Integer reorderLevel = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deactivated_at")
    private OffsetDateTime deactivatedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = "ACTIVE";
        if (reorderLevel == null) reorderLevel = 0;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    @Builder.Default
    @ManyToMany(mappedBy = "products")
    private Set<Category> categories = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private Set<SalesInvoiceProduct> salesInvoiceProducts = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private Set<PurchaseInvoiceProduct> purchaseInvoiceProducts = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private Set<InternalInvoiceProduct> internalInvoiceProducts = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private Set<ReturnSalesInvoiceProduct> returnSalesInvoiceProducts = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private Set<ReturnPurchaseInvoiceProduct> returnPurchaseInvoiceProducts = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "product")
    private Set<ProductWarehouse> productWarehouses = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return id != null && id.equals(product.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
