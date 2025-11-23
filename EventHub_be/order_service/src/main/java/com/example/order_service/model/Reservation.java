package com.example.order_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    private Long userId;
    private Long eventId;
    private Long ticketTypeId;
    private Integer quantity;

    private LocalDateTime expireAt;

    @PrePersist
    public void onCreate() {
        if (expireAt == null) expireAt = LocalDateTime.now().plusMinutes(5);
    }
}

