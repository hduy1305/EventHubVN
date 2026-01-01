package com.example.event_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "event_organizer_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventOrganizerInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String organizerCode;
    private String organizerName;
    
    @Column(columnDefinition = "LONGTEXT")
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Boolean termsAgreed;
    private String accountStatus;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Event event;
}
