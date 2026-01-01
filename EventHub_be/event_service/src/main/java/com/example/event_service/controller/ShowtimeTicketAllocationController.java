package com.example.event_service.controller;

import com.example.event_service.model.ShowtimeTicketAllocation;
import com.example.event_service.service.ShowtimeTicketAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtime-ticket-allocations")
@RequiredArgsConstructor
public class ShowtimeTicketAllocationController {
    private final ShowtimeTicketAllocationService showtimeTicketAllocationService;

    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<List<ShowtimeTicketAllocation>> getAllocationsByShowtime(@PathVariable Long showtimeId) {
        return ResponseEntity.ok(showtimeTicketAllocationService.findByShowtime(showtimeId));
    }

    @GetMapping("/ticket-type/{ticketTypeId}")
    public ResponseEntity<List<ShowtimeTicketAllocation>> getAllocationsByTicketType(@PathVariable Long ticketTypeId) {
        return ResponseEntity.ok(showtimeTicketAllocationService.findByTicketType(ticketTypeId));
    }

    @GetMapping("/showtime/{showtimeId}/ticket-type/{ticketTypeId}")
    public ResponseEntity<List<ShowtimeTicketAllocation>> getAllocationsByShowtimeAndTicketType(
            @PathVariable Long showtimeId, @PathVariable Long ticketTypeId) {
        return ResponseEntity.ok(showtimeTicketAllocationService.findByShowtimeAndTicketType(showtimeId, ticketTypeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowtimeTicketAllocation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeTicketAllocationService.getById(id));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<ShowtimeTicketAllocation> create(@RequestBody ShowtimeTicketAllocation allocation) {
        return ResponseEntity.ok(showtimeTicketAllocationService.save(allocation));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ShowtimeTicketAllocation> update(@PathVariable Long id, @RequestBody ShowtimeTicketAllocation allocation) {
        allocation.setId(id);
        return ResponseEntity.ok(showtimeTicketAllocationService.save(allocation));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        showtimeTicketAllocationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
