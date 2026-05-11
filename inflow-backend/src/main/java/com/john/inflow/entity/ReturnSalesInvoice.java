package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "return_sales_invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnSalesInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_invoice_id")
    private SalesInvoice salesInvoice;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Builder.Default
    @Column(name = "returned_at", nullable = false, updatable = false)
    private OffsetDateTime returnedAt = OffsetDateTime.now();

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Builder.Default
    @Column(name = "return_status", nullable = false, length = 40)
    private String returnStatus = "PENDING_REVIEW";

    @Builder.Default
    @Column(name = "restock_status", nullable = false, length = 40)
    private String restockStatus = "PENDING_RESTOCK";

    @Builder.Default
    @Column(name = "refund_status", nullable = false, length = 40)
    private String refundStatus = "PENDING_REFUND";

    @Column(name = "refund_method", length = 60)
    private String refundMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Column(name = "refunded_at")
    private OffsetDateTime refundedAt;

    @Column(name = "restocked_at")
    private OffsetDateTime restockedAt;

    @OneToMany(mappedBy = "returnSalesInvoice")
    private Set<ReturnSalesInvoiceProduct> returnSalesInvoiceProducts;
}
