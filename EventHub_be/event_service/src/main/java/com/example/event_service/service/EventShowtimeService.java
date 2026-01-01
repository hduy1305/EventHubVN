package com.example.event_service.service;

import com.example.event_service.model.EventShowtime;
import com.example.event_service.repository.EventShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventShowtimeService {
    private final EventShowtimeRepository eventShowtimeRepository;

    public List<EventShowtime> findByEvent(Long eventId) {
        return eventShowtimeRepository.findByEventId(eventId);
    }

    public List<EventShowtime> findByEventOrderByStartTime(Long eventId) {
        return eventShowtimeRepository.findByEventIdOrderByStartTimeAsc(eventId);
    }

    public List<EventShowtime> findByStartTimeAfter(LocalDateTime startTime) {
        return eventShowtimeRepository.findByStartTimeAfter(startTime);
    }

    public List<EventShowtime> findByEndTimeBefore(LocalDateTime endTime) {
        return eventShowtimeRepository.findByEndTimeBefore(endTime);
    }

    public List<EventShowtime> findByEventAndTimeRange(Long eventId, LocalDateTime startTime, LocalDateTime endTime) {
        return eventShowtimeRepository.findByEventIdAndStartTimeAfterAndEndTimeBefore(eventId, startTime, endTime);
    }

    public EventShowtime getById(Long id) {
        return eventShowtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("EventShowtime not found"));
    }

    public EventShowtime save(EventShowtime eventShowtime) {
        return eventShowtimeRepository.save(eventShowtime);
    }

    public void delete(Long id) {
        eventShowtimeRepository.deleteById(id);
    }
}
