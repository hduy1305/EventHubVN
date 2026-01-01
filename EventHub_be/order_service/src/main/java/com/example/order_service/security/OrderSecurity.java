package com.example.order_service.security;

import com.example.order_service.dto.EventDto;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.model.Order;
import com.example.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;


@Component("orderSecurity")
@RequiredArgsConstructor
public class OrderSecurity {

    private static final Logger log = LoggerFactory.getLogger(OrderSecurity.class); // Logger instance

    private final OrderService orderService;
    private final EventServiceClient eventServiceClient;

    public Order getOrder(Long orderId) {
        log.debug("OrderSecurity.getOrder called for orderId: {}", orderId);
        Order order = orderService.getOrderEntity(orderId);
        log.debug("OrderSecurity.getOrder fetched order: {}", order);
        return order;
    }

    public boolean isOrganizerOfOrder(UUID currentUserId, Long orderId) {
        log.debug("OrderSecurity.isOrganizerOfOrder called by userId: {} for orderId: {}", currentUserId, orderId);
        Order order = orderService.getOrderEntity(orderId);
        log.debug("OrderSecurity.isOrganizerOfOrder fetched order: {}", order);

        // Get Event details from event-service
        EventDto event = eventServiceClient.getEventById(order.getEventId());
        log.debug("OrderSecurity.isOrganizerOfOrder fetched EventDto for eventId: {}, organizerId: {}", order.getEventId(), event.getOrganizerId());

        boolean isOrganizer = currentUserId.equals(event.getOrganizerId());
        log.debug("OrderSecurity.isOrganizerOfOrder: currentUserId {} equals event.organizerId {}? -> {}", currentUserId, event.getOrganizerId(), isOrganizer);
        return isOrganizer;
    }
}
