package com.example.event_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String section;   // Khu vực (A, B, C...)
    private String rowLabel;  // Hàng (A, B, C)
    private String seatNumber;// Số ghế (01, 02,...)
    private String seatCategory; // Loại ghế (e.g., VIP, Standard)
    private Boolean isAvailable; // true = còn trống
    private Boolean locked;      // true = ghế bị khóa (không thể bán)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TicketType ticketType;
}
