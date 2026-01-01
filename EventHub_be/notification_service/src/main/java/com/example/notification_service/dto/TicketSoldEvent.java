package com.example.notification_service.dto;

import lombok.Data;

@Data
public class TicketSoldEvent {
    private String ticketCode;
    private String sellerId;
    private String sellerEmail;
    private String buyerId;
    private String price;
}
