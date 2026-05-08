package com.john.inflow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserWarehouseId implements Serializable {
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "warehouse_id")
    private Integer warehouseId;

    @Column(name = "assigned_at")
    private OffsetDateTime assignedAt = OffsetDateTime.now();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserWarehouseId that = (UserWarehouseId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(warehouseId, that.warehouseId) &&
                Objects.equals(assignedAt, that.assignedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, warehouseId, assignedAt);
    }
}
