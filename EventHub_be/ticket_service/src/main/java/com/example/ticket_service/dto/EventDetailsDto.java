package com.example.ticket_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventDetailsDto {
    private String name;
    private String category;
    private String status;
    private String organizerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
