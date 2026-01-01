package com.example.ticket_service.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PostTicketRequest {
    private String ticketCode;
    private BigDecimal price;
    private String sellerId;
}
