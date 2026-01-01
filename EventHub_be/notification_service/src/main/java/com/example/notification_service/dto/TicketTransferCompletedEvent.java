package com.example.notification_service.dto;

import lombok.Data;

@Data
public class TicketTransferCompletedEvent {
    private String ticketCode;
    private String senderEmail;
    private String recipientEmail;
}
