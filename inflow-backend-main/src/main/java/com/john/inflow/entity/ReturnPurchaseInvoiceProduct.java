package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "return_purchase_invoices_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnPurchaseInvoiceProduct {
    @EmbeddedId
    private ReturnPurchaseInvoiceProductId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("returnPurchaseInvoiceId")
    @JoinColumn(name = "return_purchase_invoice_id")
    private ReturnPurchaseInvoice returnPurchaseInvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "price_at_return", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAtReturn;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer amount;
}
