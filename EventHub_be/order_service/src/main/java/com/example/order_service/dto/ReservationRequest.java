package com.example.order_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequest {
    private Long userId;
    private Long eventId;
    private Long ticketTypeId;
    private Integer quantity;
}

