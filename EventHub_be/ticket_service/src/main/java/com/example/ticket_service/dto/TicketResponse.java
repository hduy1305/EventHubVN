package com.example.ticket_service.dto;

import com.example.ticket_service.model.Ticket;
import com.example.ticket_service.model.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private Long orderId;
    private Long eventId;
    private String userId;
    private Long seatId;
    private String seatLabel;
    private String ticketCode;
    private String showtimeCode;
    private String eventName;
    private String eventCategory;
    private String attendeeName;
    private String attendeeEmail;
    private TicketStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Nested objects with full details
    private TicketTypeInfo ticketType;
    private ShowtimeInfo showtime;
    
    @Data
    @Builder
    public static class TicketTypeInfo {
        private Long id;
        private String code;
        private String name;
    }
    
    @Data
    @Builder
    public static class ShowtimeInfo {
        private Long id;
        private String code;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
    }

    public static TicketResponse fromEntity(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .orderId(ticket.getOrderId())
                .eventId(ticket.getEventId())
                .userId(ticket.getUserId())
                .seatId(ticket.getSeatId())
                .seatLabel(ticket.getSeatLabel())
                .ticketCode(ticket.getTicketCode())
                .showtimeCode(ticket.getShowtimeCode())
                .attendeeName(ticket.getAttendeeName())
                .attendeeEmail(ticket.getAttendeeEmail())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
