package com.john.inflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
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

    @Email
    @Size(max = 255)
    @Column(length = 255)
    private String email;

    @Size(max = 100)
    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deactivated_at")
    private OffsetDateTime deactivatedAt;

    @OneToMany(mappedBy = "supplier")
    private Set<Product> products;

    @OneToMany(mappedBy = "supplier")
    private Set<PurchaseInvoice> purchaseInvoices;

    @OneToMany(mappedBy = "supplier")
    private Set<ReturnPurchaseInvoice> returnPurchaseInvoices;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
