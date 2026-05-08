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
public class ReturnPurchaseInvoiceProductId implements Serializable {
    @Column(name = "return_purchase_invoice_id")
    private Integer returnPurchaseInvoiceId;

    @Column(name = "product_id")
    private Integer productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReturnPurchaseInvoiceProductId that = (ReturnPurchaseInvoiceProductId) o;
        return Objects.equals(returnPurchaseInvoiceId, that.returnPurchaseInvoiceId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(returnPurchaseInvoiceId, productId);
    }
}
