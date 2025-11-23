package com.example.event_service.service;

import com.example.event_service.model.TicketType;
import com.example.event_service.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketTypeRepository ticketTypeRepository;

    public List<TicketType> findByEvent(Long eventId) {
        return ticketTypeRepository.findByEventId(eventId);
    }

    public TicketType save(TicketType ticketType) {
        return ticketTypeRepository.save(ticketType);
    }

    public void delete(Long id) {
        ticketTypeRepository.deleteById(id);
    }
}

