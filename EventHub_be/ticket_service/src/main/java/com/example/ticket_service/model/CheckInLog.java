package com.example.ticket_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "check_in_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    private Long eventId;

    private String userId;

    private LocalDateTime checkInTime;

    @PrePersist
    public void onCreate() {
        if (this.checkInTime == null) this.checkInTime = LocalDateTime.now();
    }
}
