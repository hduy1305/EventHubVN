package com.example.ticket_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long eventId;
    private Long ticketTypeId; // Link to the ticket type
    private String userId;
    private Long seatId; // Link to specific seat if applicable
    private String seatLabel;
    private String ticketCode; // Unique code for QR/PDF
    private String attendeeName;
    private String attendeeEmail;

    @Enumerated(EnumType.STRING)
    private TicketStatus status; // ISSUED, SCANNED, REFUNDED, TRANSFERRED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (status == null) status = TicketStatus.ISSUED;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


}
