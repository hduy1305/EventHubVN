package com.example.notification_service.dto;

import lombok.Data;

@Data
public class TicketTransferRequestedEvent {
    private String ticketCode;
    private String transferId;
    private String senderEmail;
    private String recipientEmail;
}
