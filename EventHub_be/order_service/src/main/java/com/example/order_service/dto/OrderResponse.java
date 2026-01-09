package com.example.order_service.dto;

import com.example.order_service.model.Order;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private UUID userId;
    private Long eventId;
    private BigDecimal totalAmount;
    private String currency; // New field
    private String discountCode; // New field
    private String paymentMethod; // New field
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;

    public static OrderResponse fromEntity(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .eventId(order.getEventId())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .discountCode(order.getDiscountCode())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems() == null ? List.of() :
                        order.getItems().stream().map(OrderItemResponse::fromEntity).collect(Collectors.toList()))
                .build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long ticketTypeId;
        private Long showtimeId;
        private int quantity;
        private BigDecimal price;

        public static OrderItemResponse fromEntity(com.example.order_service.model.OrderItem item) {
            return OrderItemResponse.builder()
                    .id(item.getId())
                    .ticketTypeId(item.getTicketTypeId())
                    .showtimeId(item.getShowtimeId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build();
        }
    }
}
