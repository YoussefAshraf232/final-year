package com.john.inflow.repository;

import com.john.inflow.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    @Query("""
            SELECT n FROM Notification n
            WHERE n.user.id = :userId
              AND (:unreadOnly = false OR n.readAt IS NULL)
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findForUser(@Param("userId") Integer userId, @Param("unreadOnly") boolean unreadOnly, Pageable pageable);

    boolean existsByUserIdAndTypeAndRelatedEntityTypeAndRelatedEntityIdAndReadAtIsNull(
            Integer userId,
            String type,
            String relatedEntityType,
            Integer relatedEntityId
    );
}
