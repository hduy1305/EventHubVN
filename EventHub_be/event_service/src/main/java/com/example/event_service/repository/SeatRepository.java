package com.example.event_service.repository;

import com.example.event_service.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByEventId(Long eventId);
    List<Seat> findByTicketTypeId(Long ticketTypeId);
}
