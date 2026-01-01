package com.example.order_service.controller;

import com.example.order_service.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')") // Only ADMINs and ORGANIZERs can access reports
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/revenue/total")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(reportingService.calculateTotalRevenue()); // TODO: Implement in ReportingService
    }

    @GetMapping("/revenue/event/{eventId}")
    public ResponseEntity<BigDecimal> getRevenueForEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(reportingService.getRevenueByEvent(eventId));
    }

    @GetMapping("/tickets/total-sold")
    public ResponseEntity<Long> getTotalTicketsSold() {
        return ResponseEntity.ok(reportingService.getTotalTicketsSold()); // TODO: Implement in ReportingService
    }

    @GetMapping("/tickets/event/{eventId}/sold")
    public ResponseEntity<Long> getTicketsSoldForEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(reportingService.getTicketsSoldByEvent(eventId));
    }
}
