package com.example.event_service.controller;

import com.example.event_service.model.TicketType;
import com.example.event_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketType>> getTicketsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketService.findByEvent(eventId));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<TicketType> create(@RequestBody TicketType ticketType) {
        return ResponseEntity.ok(ticketService.save(ticketType));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

