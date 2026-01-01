package com.example.ticket_service.controller;

import com.example.ticket_service.model.CheckInLog;
import com.example.ticket_service.service.CheckInLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckInLogController {
    private final CheckInLogService checkInLogService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<CheckInLog>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(checkInLogService.findByEvent(eventId));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<CheckInLog>> getByTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(checkInLogService.findByTicket(ticketId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CheckInLog>> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(checkInLogService.findByUser(userId));
    }
}
