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
public class InternalInvoiceProductId implements Serializable {
    @Column(name = "internal_invoice_id")
    private Integer internalInvoiceId;

    @Column(name = "product_id")
    private Integer productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InternalInvoiceProductId that = (InternalInvoiceProductId) o;
        return Objects.equals(internalInvoiceId, that.internalInvoiceId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(internalInvoiceId, productId);
    }
}
