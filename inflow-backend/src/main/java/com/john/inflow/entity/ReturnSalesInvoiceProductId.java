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
public class ReturnSalesInvoiceProductId implements Serializable {
    @Column(name = "return_sales_invoice_id")
    private Integer returnSalesInvoiceId;

    @Column(name = "product_id")
    private Integer productId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReturnSalesInvoiceProductId that = (ReturnSalesInvoiceProductId) o;
        return Objects.equals(returnSalesInvoiceId, that.returnSalesInvoiceId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(returnSalesInvoiceId, productId);
    }
}
