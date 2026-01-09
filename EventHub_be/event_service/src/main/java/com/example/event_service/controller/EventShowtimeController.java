package com.example.event_service.controller;

import com.example.event_service.model.EventShowtime;
import com.example.event_service.service.EventShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class EventShowtimeController {
    private final EventShowtimeService eventShowtimeService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventShowtime>> getShowtimesByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventShowtimeService.findByEventOrderByStartTime(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventShowtime> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventShowtimeService.getById(id));
    }
    
    // Internal endpoint for ticket service - no auth required
    @GetMapping("/internal/{id}")
    public ResponseEntity<EventShowtime> getByIdInternal(@PathVariable Long id) {
        return ResponseEntity.ok(eventShowtimeService.getById(id));
    }
    
    @GetMapping("/event/{eventId}/by-code")
    public ResponseEntity<EventShowtime> getByEventAndCode(
            @PathVariable Long eventId, 
            @RequestParam String code) {
        return ResponseEntity.ok(eventShowtimeService.findByEventIdAndCode(eventId, code));
    }

    @GetMapping("/after")
    public ResponseEntity<List<EventShowtime>> getShowtimesAfter(
            @RequestParam LocalDateTime startTime) {
        return ResponseEntity.ok(eventShowtimeService.findByStartTimeAfter(startTime));
    }

    @GetMapping("/before")
    public ResponseEntity<List<EventShowtime>> getShowtimesBefore(
            @RequestParam LocalDateTime endTime) {
        return ResponseEntity.ok(eventShowtimeService.findByEndTimeBefore(endTime));
    }

    @GetMapping("/event/{eventId}/range")
    public ResponseEntity<List<EventShowtime>> getShowtimesByEventAndTimeRange(
            @PathVariable Long eventId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime) {
        return ResponseEntity.ok(eventShowtimeService.findByEventAndTimeRange(eventId, startTime, endTime));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<EventShowtime> create(@RequestBody EventShowtime eventShowtime) {
        return ResponseEntity.ok(eventShowtimeService.save(eventShowtime));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<EventShowtime> update(@PathVariable Long id, @RequestBody EventShowtime eventShowtime) {
        eventShowtime.setId(id);
        return ResponseEntity.ok(eventShowtimeService.save(eventShowtime));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        eventShowtimeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
