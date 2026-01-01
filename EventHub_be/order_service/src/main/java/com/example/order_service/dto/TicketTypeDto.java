package com.example.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTypeDto {
    private Long id;
    private String name;
    private Long eventId;
    private BigDecimal price;
    private Integer quota;
    private Integer purchaseLimit;
    private LocalDateTime startSale;
    private LocalDateTime endSale;
}
