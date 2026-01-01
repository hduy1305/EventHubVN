package com.example.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    private Long id;
    private UUID organizerId; // New field: organizerId (UUID)
    private LocalDateTime startTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private Boolean allowTicketTransfer;
    private Boolean allowAttendeeNameChange;
    private Boolean refundEnabled;
    private Integer refundDeadlineHours;
    private Double refundFeePercent;
}
