package com.example.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDto {
    private Long id;
    private UUID userId;
    private Long eventId;
    private Long ticketTypeId;
    private Long seatId;
    private Integer quantity;
    private LocalDateTime expireAt;
    private String status; // ReservationStatus enum as String
}
