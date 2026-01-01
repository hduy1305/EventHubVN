package com.example.event_service.repository;

import com.example.event_service.model.ShowtimeTicketAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeTicketAllocationRepository extends JpaRepository<ShowtimeTicketAllocation, Long> {
    List<ShowtimeTicketAllocation> findByShowtimeId(Long showtimeId);
    List<ShowtimeTicketAllocation> findByTicketTypeId(Long ticketTypeId);
    List<ShowtimeTicketAllocation> findByShowtimeIdAndTicketTypeId(Long showtimeId, Long ticketTypeId);
}
