package com.example.event_service.controller;

import com.example.event_service.model.TicketZone;
import com.example.event_service.service.TicketZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-zones")
@RequiredArgsConstructor
public class TicketZoneController {
    private final TicketZoneService ticketZoneService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketZone>> getTicketZonesByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketZoneService.findByEvent(eventId));
    }

    @GetMapping("/ticket-type/{ticketTypeId}")
    public ResponseEntity<List<TicketZone>> getTicketZonesByTicketType(@PathVariable Long ticketTypeId) {
        return ResponseEntity.ok(ticketZoneService.findByTicketType(ticketTypeId));
    }

    @GetMapping("/event/{eventId}/ticket-type/{ticketTypeId}")
    public ResponseEntity<List<TicketZone>> getTicketZonesByEventAndTicketType(
            @PathVariable Long eventId, @PathVariable Long ticketTypeId) {
        return ResponseEntity.ok(ticketZoneService.findByEventAndTicketType(eventId, ticketTypeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketZone> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketZoneService.getById(id));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<TicketZone> create(@RequestBody TicketZone ticketZone) {
        return ResponseEntity.ok(ticketZoneService.save(ticketZone));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<TicketZone> update(@PathVariable Long id, @RequestBody TicketZone ticketZone) {
        ticketZone.setId(id);
        return ResponseEntity.ok(ticketZoneService.save(ticketZone));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketZoneService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
