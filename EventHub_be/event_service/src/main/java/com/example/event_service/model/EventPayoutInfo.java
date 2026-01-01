package com.example.event_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_payout_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventPayoutInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountHolderName;
    private String bankNumber;
    private String bankName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Event event;
}
