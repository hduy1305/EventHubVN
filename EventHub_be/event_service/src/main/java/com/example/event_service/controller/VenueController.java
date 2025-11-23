package com.example.event_service.controller;


import com.example.event_service.model.Venue;
import com.example.event_service.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {
    private final VenueService venueService;

    @GetMapping
    public ResponseEntity<List<Venue>> getAll() {
        return ResponseEntity.ok(venueService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.findById(id));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PostMapping
    public ResponseEntity<Venue> create(@RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.save(venue));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Venue> update(@PathVariable Long id, @RequestBody Venue venue) {
        venue.setId(id);
        return ResponseEntity.ok(venueService.save(venue));
    }

    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        venueService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

