package com.example.order_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "BINARY(16)")
    private UUID userId;
    private Long eventId;
    private Long ticketTypeId;
    private Long seatId; // New field to link to a specific seat
    private Integer quantity;

    private LocalDateTime expireAt;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status; // New field for reservation status

    @PrePersist
    public void onCreate() {
        if (expireAt == null) expireAt = LocalDateTime.now().plusMinutes(5);
        if (status == null) status = ReservationStatus.PENDING;
    }

    public enum ReservationStatus {
        PENDING, CONFIRMED, EXPIRED, CANCELLED
    }
}
