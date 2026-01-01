package com.example.event_service.repository;

import com.example.event_service.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
    List<Event> findByStatus(Event.Status status);
    List<Event> findByCategoryIgnoreCase(String category);

    // Search by keyword (name or description)
    List<Event> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    // Filter by time
    List<Event> findByStartTimeAfter(LocalDateTime startTime);
    List<Event> findByEndTimeBefore(LocalDateTime endTime);
    List<Event> findByStartTimeAfterAndEndTimeBefore(LocalDateTime startTime, LocalDateTime endTime);

    // Filter by location (venue city)
    List<Event> findByVenue_CityIgnoreCase(String city);

    // Combined search and filter methods
    List<Event> findByCategoryIgnoreCaseAndNameContainingIgnoreCaseOrCategoryIgnoreCaseAndDescriptionContainingIgnoreCase(String categoryForName, String nameKeyword, String categoryForDescription, String descriptionKeyword);
    List<Event> findByCategoryIgnoreCaseAndStartTimeAfter(String category, LocalDateTime startTime);
    List<Event> findByCategoryIgnoreCaseAndEndTimeBefore(String category, LocalDateTime endTime);
    List<Event> findByCategoryIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String category, LocalDateTime startTime, LocalDateTime endTime);
    List<Event> findByCategoryIgnoreCaseAndVenue_CityIgnoreCase(String category, String city);
    List<Event> findByCategoryIgnoreCaseAndVenue_CityIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String category, String city, LocalDateTime startTime, LocalDateTime endTime);


    List<Event> findByNameContainingIgnoreCaseAndStartTimeAfter(String name, LocalDateTime startTime);
    List<Event> findByNameContainingIgnoreCaseAndEndTimeBefore(String name, LocalDateTime endTime);
    List<Event> findByNameContainingIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String name, LocalDateTime startTime, LocalDateTime endTime);
    List<Event> findByNameContainingIgnoreCaseAndVenue_CityIgnoreCase(String name, String city);
    List<Event> findByNameContainingIgnoreCaseAndVenue_CityIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String name, String city, LocalDateTime startTime, LocalDateTime endTime);


    List<Event> findByDescriptionContainingIgnoreCaseAndStartTimeAfter(String description, LocalDateTime startTime);
    List<Event> findByDescriptionContainingIgnoreCaseAndEndTimeBefore(String description, LocalDateTime endTime);
    List<Event> findByDescriptionContainingIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String description, LocalDateTime startTime, LocalDateTime endTime);
    List<Event> findByDescriptionContainingIgnoreCaseAndVenue_CityIgnoreCase(String description, String city);
    List<Event> findByDescriptionContainingIgnoreCaseAndVenue_CityIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String description, String city, LocalDateTime startTime, LocalDateTime endTime);


    List<Event> findByVenue_CityIgnoreCaseAndStartTimeAfterAndEndTimeBefore(String city, LocalDateTime startTime, LocalDateTime endTime);

    Optional<Event> findByCustomUrl(String customUrl);
    boolean existsByCustomUrl(String customUrl);
}
