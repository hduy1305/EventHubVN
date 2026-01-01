package com.example.ticket_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketTransferCompletedEvent {
    private String ticketCode;
    private String senderEmail;
    private String recipientEmail;
}
