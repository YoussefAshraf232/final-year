package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
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

    @Size(max = 255)
    @Column(length = 255)
    private String email;

    @Size(max = 200)
    @Column(length = 200)
    private String address;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "deactivated_at")
    private OffsetDateTime deactivatedAt;

    @OneToMany(mappedBy = "customer")
    private Set<SalesInvoice> salesInvoices;

    @OneToMany(mappedBy = "customer")
    private Set<ReturnSalesInvoice> returnSalesInvoices;
}
