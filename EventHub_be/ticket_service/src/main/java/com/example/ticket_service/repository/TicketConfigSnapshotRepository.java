package com.example.ticket_service.repository;

import com.example.ticket_service.model.TicketConfigSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketConfigSnapshotRepository extends JpaRepository<TicketConfigSnapshot, Long> {
    Optional<TicketConfigSnapshot> findTopByEventIdOrderByCreatedAtDesc(Long eventId);
}
