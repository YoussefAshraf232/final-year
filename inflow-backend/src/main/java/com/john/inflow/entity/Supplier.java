package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 20)
    @Column(length = 20)
    private String phone;

    @Size(max = 200)
    @Column(length = 200)
    private String address;

    @OneToMany(mappedBy = "supplier")
    private Set<Product> products;

    @OneToMany(mappedBy = "supplier")
    private Set<PurchaseInvoice> purchaseInvoices;

    @OneToMany(mappedBy = "supplier")
    private Set<ReturnPurchaseInvoice> returnPurchaseInvoices;
}
