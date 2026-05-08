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
public class SalesInvoiceProductId implements Serializable {
    @Column(name = "sales_invoice_id")
    private Integer salesInvoiceId;

    @Column(name = "product_id")
    private Integer productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SalesInvoiceProductId that = (SalesInvoiceProductId) o;
        return Objects.equals(salesInvoiceId, that.salesInvoiceId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(salesInvoiceId, productId);
    }
}
