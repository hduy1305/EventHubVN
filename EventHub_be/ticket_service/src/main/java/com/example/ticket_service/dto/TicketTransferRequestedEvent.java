package com.example.ticket_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketTransferRequestedEvent {
    private String ticketCode;
    private String transferId;
    private String senderEmail;
    private String recipientEmail;
}
