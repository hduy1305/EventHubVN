package com.example.ticket_service.dto;

import lombok.Data;

@Data
public class TicketTransferRequest {
    private String senderId;
    private String recipientEmail;
}
