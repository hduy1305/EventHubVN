package com.example.order_service.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequest {
    private UUID userId;
    private Long eventId;
    private Long ticketTypeId;
    private Long seatId; // New field for seat ID
    private Integer quantity;
}
