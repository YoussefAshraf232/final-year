package com.john.inflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseInvoiceProductId implements Serializable {
    @Column(name = "purchase_invoice_id")
    private Integer purchaseInvoiceId;

    @Column(name = "product_id")
    private Integer productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PurchaseInvoiceProductId that = (PurchaseInvoiceProductId) o;
        return Objects.equals(purchaseInvoiceId, that.purchaseInvoiceId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(purchaseInvoiceId, productId);
    }
}
