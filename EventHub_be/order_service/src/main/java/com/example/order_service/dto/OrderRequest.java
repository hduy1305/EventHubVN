package com.example.order_service.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private UUID userId;
    private Long eventId;
    private List<Long> reservationIds; // New field: List of reservation IDs to convert to order
    private String discountCode;       // New field: Discount code applied
    private String paymentMethod;      // New field: Payment method chosen
    private String currency;           // New field: Currency for the order

    // OrderItemRequest might need to be re-evaluated or removed if tickets are created directly from reservations
    // For now, keeping it for potential general ticket purchases without prior reservation
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Long ticketTypeId;
        private Integer quantity; // Quantity of tickets for this type
        private Double price;
        private List<Long> seatIds; // Optional: specific seat IDs if not coming from reservations
    }
}
