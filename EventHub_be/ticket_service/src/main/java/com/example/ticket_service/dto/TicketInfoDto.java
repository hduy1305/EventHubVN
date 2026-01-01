package com.example.ticket_service.dto;

import com.example.ticket_service.model.Ticket;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketInfoDto {
    private Long id;
    private String ticketCode;
    private String attendeeName;
    private String attendeeEmail;
    private String status;
    private String seatLabel;

    public static TicketInfoDto fromEntity(Ticket ticket) {
        return TicketInfoDto.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .attendeeName(ticket.getAttendeeName())
                .attendeeEmail(ticket.getAttendeeEmail())
                .status(ticket.getStatus() != null ? ticket.getStatus().name() : null)
                .seatLabel(ticket.getSeatLabel())
                .build();
    }
}
