package com.example.order_service.dto;

import com.example.order_service.model.Order;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public static OrderResponse fromEntity(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
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
        private Long ticketTypeId;
        private Integer quantity;
        private Double price;

        public static OrderItemResponse fromEntity(com.example.order_service.model.OrderItem item) {
            return OrderItemResponse.builder()
                    .ticketTypeId(item.getTicketTypeId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice().doubleValue())
                    .build();
        }
    }
}

