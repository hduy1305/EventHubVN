package com.example.event_service.controller;

import com.example.event_service.model.Seat;
import com.example.event_service.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Seat>> getSeatsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(seatService.findByEvent(eventId));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<Seat> create(@RequestBody Seat seat) {
        return ResponseEntity.ok(seatService.save(seat));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PutMapping("/{seatId}/availability")
    public ResponseEntity<Void> updateAvailability(
            @PathVariable Long seatId, @RequestParam boolean available) {
        seatService.updateAvailability(seatId, available);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        seatService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

