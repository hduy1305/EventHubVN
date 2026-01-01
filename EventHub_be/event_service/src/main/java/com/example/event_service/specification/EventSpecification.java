package com.example.event_service.specification;

import com.example.event_service.model.Event;
import com.example.event_service.model.TicketType;
import com.example.event_service.model.Venue;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EventSpecification {

    public static Specification<Event> withFilters(String keyword, String category, LocalDateTime startTime, LocalDateTime endTime, BigDecimal minPrice, BigDecimal maxPrice, String location, Event.Status status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                ));
            }

            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
            }

            if (startTime != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), startTime));
            }

            if (endTime != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endTime"), endTime));
            }

            if (location != null && !location.isEmpty()) {
                Join<Event, Venue> venueJoin = root.join("venue", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(venueJoin.get("city")), location.toLowerCase()));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Price filtering requires joining with TicketType
            if (minPrice != null || maxPrice != null) {
                Join<Event, TicketType> ticketTypeJoin = root.join("ticketTypes", JoinType.LEFT); // Assuming "ticketTypes" is the field name in Event
                // We need to ensure we only select DISTINCT events later or use distinct in query
                query.distinct(true);

                if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(ticketTypeJoin.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(ticketTypeJoin.get("price"), maxPrice));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
