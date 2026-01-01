package com.example.order_service.controller;

import com.example.order_service.dto.DailySalesDto;
import com.example.order_service.dto.EventDto;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    private final ReportingService reportingService;
    private final EventServiceClient eventServiceClient;

    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @GetMapping("/events/{eventId}/daily-sales")
    public ResponseEntity<List<DailySalesDto>> getDailySales(
            @PathVariable Long eventId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        EventDto event = eventServiceClient.getEventById(eventId);
        LocalDate defaultStart = resolveDefaultStartDate(event);
        LocalDate defaultEnd = resolveDefaultEndDate(event, defaultStart);

        LocalDate effectiveStart = startDate != null && startDate.isAfter(defaultStart) ? startDate : defaultStart;
        LocalDate effectiveEnd = endDate != null ? endDate : defaultEnd;

        List<DailySalesDto> response = reportingService.getDailySales(eventId, effectiveStart, effectiveEnd);
        return ResponseEntity.ok(response);
    }

    private LocalDate resolveDefaultStartDate(EventDto event) {
        if (event == null) {
            return LocalDate.now();
        }
        if ("PUBLISHED".equalsIgnoreCase(event.getStatus()) && event.getUpdatedAt() != null) {
            return event.getUpdatedAt().toLocalDate();
        }
        if (event.getCreatedAt() != null) {
            return event.getCreatedAt().toLocalDate();
        }
        if (event.getStartTime() != null) {
            return event.getStartTime().toLocalDate();
        }
        return LocalDate.now();
    }

    private LocalDate resolveDefaultEndDate(EventDto event, LocalDate fallback) {
        if (event != null && event.getStartTime() != null) {
            return event.getStartTime().toLocalDate();
        }
        LocalDate today = LocalDate.now();
        if (fallback != null && today.isBefore(fallback)) {
            return fallback;
        }
        return today;
    }
}
