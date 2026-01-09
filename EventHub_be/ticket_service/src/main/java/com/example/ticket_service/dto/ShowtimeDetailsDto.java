package com.example.ticket_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShowtimeDetailsDto {
    private Long id;
    private String code;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
