package com.example.event_service.service;

import com.example.event_service.model.TicketZone;
import com.example.event_service.repository.TicketZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketZoneService {
    private final TicketZoneRepository ticketZoneRepository;

    public List<TicketZone> findByEvent(Long eventId) {
        return ticketZoneRepository.findByEventId(eventId);
    }

    public List<TicketZone> findByTicketType(Long ticketTypeId) {
        return ticketZoneRepository.findByTicketTypeId(ticketTypeId);
    }

    public List<TicketZone> findByEventAndTicketType(Long eventId, Long ticketTypeId) {
        return ticketZoneRepository.findByEventIdAndTicketTypeId(eventId, ticketTypeId);
    }

    public TicketZone getById(Long id) {
        return ticketZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TicketZone not found"));
    }

    public TicketZone save(TicketZone ticketZone) {
        return ticketZoneRepository.save(ticketZone);
    }

    public void delete(Long id) {
        ticketZoneRepository.deleteById(id);
    }
}
