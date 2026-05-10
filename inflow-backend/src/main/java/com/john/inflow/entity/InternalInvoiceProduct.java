package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "internal_invoices_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternalInvoiceProduct {
    @EmbeddedId
    private InternalInvoiceProductId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("internalInvoiceId")
    @JoinColumn(name = "internal_invoice_id")
    private InternalInvoice internalInvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer amount;
}
