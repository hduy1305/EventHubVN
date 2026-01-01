package com.example.event_service.service;

import com.example.event_service.model.ShowtimeTicketAllocation;
import com.example.event_service.repository.ShowtimeTicketAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowtimeTicketAllocationService {
    private final ShowtimeTicketAllocationRepository showtimeTicketAllocationRepository;

    public List<ShowtimeTicketAllocation> findByShowtime(Long showtimeId) {
        return showtimeTicketAllocationRepository.findByShowtimeId(showtimeId);
    }

    public List<ShowtimeTicketAllocation> findByTicketType(Long ticketTypeId) {
        return showtimeTicketAllocationRepository.findByTicketTypeId(ticketTypeId);
    }

    public List<ShowtimeTicketAllocation> findByShowtimeAndTicketType(Long showtimeId, Long ticketTypeId) {
        return showtimeTicketAllocationRepository.findByShowtimeIdAndTicketTypeId(showtimeId, ticketTypeId);
    }

    public ShowtimeTicketAllocation getById(Long id) {
        return showtimeTicketAllocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ShowtimeTicketAllocation not found"));
    }

    public ShowtimeTicketAllocation save(ShowtimeTicketAllocation showtimeTicketAllocation) {
        return showtimeTicketAllocationRepository.save(showtimeTicketAllocation);
    }

    public void delete(Long id) {
        showtimeTicketAllocationRepository.deleteById(id);
    }
}
