package com.example.event_service.service;

import com.example.event_service.model.Venue;
import com.example.event_service.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueService {
    private final VenueRepository venueRepository;

    public List<Venue> findAll() {
        return venueRepository.findAll();
    }

    public Venue findById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    public Venue save(Venue venue) {
        return venueRepository.save(venue);
    }

    public void delete(Long id) {
        venueRepository.deleteById(id);
    }
}

