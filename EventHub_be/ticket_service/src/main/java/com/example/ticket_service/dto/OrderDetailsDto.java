package com.example.ticket_service.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OrderDetailsDto {
    private Long id;
    private UUID userId;
    private Long eventId;
    private List<OrderItemDto> items;

    @Data
    public static class OrderItemDto {
        private Long ticketTypeId;
        private int quantity;
    }
}
