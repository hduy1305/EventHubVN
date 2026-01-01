package com.example.ticket_service.dto;

import com.example.ticket_service.model.Ticket;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CheckInLogDto {
    private Long id;
    private Long eventId;
    private String userId;
    private LocalDateTime checkInTime;
    private String gate;
    private String deviceId;
    private TicketInfoDto ticket;

    public static CheckInLogDto fromTicket(Ticket ticket) {
        return CheckInLogDto.builder()
                .id(ticket.getId())
                .eventId(ticket.getEventId())
                .userId(ticket.getUserId())
                .checkInTime(ticket.getUpdatedAt())
                .gate(null)
                .deviceId(null)
                .ticket(TicketInfoDto.fromEntity(ticket))
                .build();
    }
}
