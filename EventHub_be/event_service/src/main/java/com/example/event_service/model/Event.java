package com.example.event_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "BINARY(16)")
    private UUID organizerId;  // liên kết với AuthService (User/Organization)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String eventCode;

    @Column(columnDefinition = "LONGTEXT")
    private String logoUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String bannerUrl;

    @Column(unique = true, nullable = true)
    private String customUrl;

    @Enumerated(EnumType.STRING)
    private Privacy privacy;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketType> ticketTypes = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EventShowtime> showtimes = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TicketZone> ticketZones = new ArrayList<>();

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private EventOrganizerInfo organizerInfo;

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private EventPayoutInfo payoutInfo;

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private EventInvoiceInfo invoiceInfo;

    @Column(columnDefinition = "LONGTEXT")
    private String coverImage;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Builder.Default
    private Boolean allowTicketTransfer = false; // New field
    @Builder.Default
    private Boolean allowAttendeeNameChange = false; // New field
    
    @Builder.Default
    private Boolean refundEnabled = false;
    @Builder.Default
    private Integer refundDeadlineHours = 24; // Default 24 hours before event
    @Builder.Default
    private Double refundFeePercent = 0.0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (status == null) status = Status.DRAFT;
        if (allowTicketTransfer == null) allowTicketTransfer = false;
        if (allowAttendeeNameChange == null) allowAttendeeNameChange = false;
        if (refundEnabled == null) refundEnabled = false;
        if (refundDeadlineHours == null) refundDeadlineHours = 24;
        if (refundFeePercent == null) refundFeePercent = 0.0;
        if (privacy == null) privacy = Privacy.PUBLIC;
        
        // customUrl is only required for PRIVATE events, set to null if empty or PUBLIC
        if (privacy == Privacy.PUBLIC || (customUrl != null && customUrl.trim().isEmpty())) {
            customUrl = null;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        
        // customUrl is only required for PRIVATE events, set to null if empty or PUBLIC
        if (privacy == Privacy.PUBLIC || (customUrl != null && customUrl.trim().isEmpty())) {
            customUrl = null;
        }
    }

    public enum Status {
        DRAFT, PENDING_APPROVAL, PUBLISHED, CANCELLED
    }

    public enum Privacy {
        PUBLIC, PRIVATE
    }
}
