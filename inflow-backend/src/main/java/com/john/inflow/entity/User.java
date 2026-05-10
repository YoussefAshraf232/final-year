package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Size(max = 30)
    @Column(name = "f_name", length = 30)
    private String firstName;

    @Size(max = 30)
    @Column(name = "l_name", length = 30)
    private String lastName;

    @NotBlank
    @Size(max = 20)
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_role", nullable = false)
    private Role role;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "left_at")
    private OffsetDateTime leftAt;

    @OneToMany(mappedBy = "user")
    private Set<SalesInvoice> salesInvoices;

    @OneToMany(mappedBy = "user")
    private Set<ReturnSalesInvoice> returnSalesInvoices;

    @OneToMany(mappedBy = "user")
    private Set<PurchaseInvoice> purchaseInvoices;

    @OneToMany(mappedBy = "user")
    private Set<ReturnPurchaseInvoice> returnPurchaseInvoices;

    @OneToMany(mappedBy = "user")
    private Set<InternalInvoice> internalInvoices;

    @OneToMany(mappedBy = "user")
    private Set<UserWarehouse> userWarehouses;
}
