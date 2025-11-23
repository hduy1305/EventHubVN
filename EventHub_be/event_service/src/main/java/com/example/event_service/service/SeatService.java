package com.example.event_service.service;

import com.example.event_service.model.Seat;
import com.example.event_service.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;

    public List<Seat> findByEvent(Long eventId) {
        return seatRepository.findByEventId(eventId);
    }

    public Seat save(Seat seat) {
        if (seat.getIsAvailable() == null) seat.setIsAvailable(true);
        return seatRepository.save(seat);
    }

    public void updateAvailability(Long seatId, boolean available) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));
        seat.setIsAvailable(available);
        seatRepository.save(seat);
    }

    public void delete(Long id) {
        seatRepository.deleteById(id);
    }
}

