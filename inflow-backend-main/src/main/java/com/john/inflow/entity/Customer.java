package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
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

    @OneToMany(mappedBy = "customer")
    private Set<SalesInvoice> salesInvoices;

    @OneToMany(mappedBy = "customer")
    private Set<ReturnSalesInvoice> returnSalesInvoices;
}
