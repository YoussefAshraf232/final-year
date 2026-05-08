package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String address;

    @Builder.Default
    @Column(name = "is_central")
    private Boolean isCentral = false;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "warehouse")
    private Set<SalesInvoice> salesInvoices;

    @OneToMany(mappedBy = "warehouse")
    private Set<ReturnSalesInvoice> returnSalesInvoices;

    @OneToMany(mappedBy = "warehouse")
    private Set<PurchaseInvoice> purchaseInvoices;

    @OneToMany(mappedBy = "warehouse")
    private Set<ReturnPurchaseInvoice> returnPurchaseInvoices;

    @OneToMany(mappedBy = "sourceWarehouse")
    private Set<InternalInvoice> internalInvoicesSent;

    @OneToMany(mappedBy = "destinationWarehouse")
    private Set<InternalInvoice> internalInvoicesReceived;

    @OneToMany(mappedBy = "warehouse")
    private Set<UserWarehouse> userWarehouses;

    @OneToMany(mappedBy = "warehouse")
    private Set<ProductWarehouse> productWarehouses;
}
