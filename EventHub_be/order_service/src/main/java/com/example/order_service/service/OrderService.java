package com.example.order_service.service;

import com.example.order_service.repository.OrderItemRepository;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.dto.OrderRequest;
import com.example.order_service.dto.OrderResponse;
import com.example.order_service.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        BigDecimal total = request.getItems().stream()
                .map(i -> BigDecimal.valueOf(i.getPrice()).multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        Order finalOrder = order;
        List<OrderItem> items = request.getItems().stream()
                .map(i -> OrderItem.builder()
                        .order(finalOrder)
                        .ticketTypeId(i.getTicketTypeId())
                        .quantity(i.getQuantity())
                        .price(BigDecimal.valueOf(i.getPrice()))
                        .build())
                .collect(Collectors.toList());

        orderItemRepository.saveAll(items);
        order.setItems(items);

        return OrderResponse.fromEntity(order);
    }

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrder(Long id) {
        return orderRepository.findById(id)
                .map(OrderResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}

