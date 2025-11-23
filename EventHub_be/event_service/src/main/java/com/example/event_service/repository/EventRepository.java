package com.example.event_service.repository;

import com.example.event_service.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(Event.Status status);
    List<Event> findByCategoryIgnoreCase(String category);
}
