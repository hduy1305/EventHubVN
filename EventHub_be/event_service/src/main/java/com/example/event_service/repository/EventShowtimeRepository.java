package com.example.event_service.repository;

import com.example.event_service.model.EventShowtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventShowtimeRepository extends JpaRepository<EventShowtime, Long> {
    List<EventShowtime> findByEventId(Long eventId);
    List<EventShowtime> findByEventIdOrderByStartTimeAsc(Long eventId);
    List<EventShowtime> findByStartTimeAfter(LocalDateTime startTime);
    List<EventShowtime> findByEndTimeBefore(LocalDateTime endTime);
    List<EventShowtime> findByEventIdAndStartTimeAfterAndEndTimeBefore(Long eventId, LocalDateTime startTime, LocalDateTime endTime);
    Optional<EventShowtime> findByEventIdAndCode(Long eventId, String code);
}
