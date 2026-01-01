package com.example.event_service.repository;

import com.example.event_service.model.TicketZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketZoneRepository extends JpaRepository<TicketZone, Long> {
    List<TicketZone> findByEventId(Long eventId);
    List<TicketZone> findByTicketTypeId(Long ticketTypeId);
    List<TicketZone> findByEventIdAndTicketTypeId(Long eventId, Long ticketTypeId);
}
