package com.example.order_service.repository;

import com.example.order_service.model.Order;
import com.example.order_service.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(UUID userId);
    List<Order> findByEventId(Long eventId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByEventIdAndStatus(Long eventId, OrderStatus status);
    List<Order> findByEventIdAndStatusAndCreatedAtBetween(Long eventId, OrderStatus status, LocalDateTime startDate, LocalDateTime endDate);
}
