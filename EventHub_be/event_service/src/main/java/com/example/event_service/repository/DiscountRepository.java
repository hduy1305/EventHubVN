package com.example.event_service.repository;

import com.example.event_service.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    Optional<Discount> findByEventIdAndCode(Long eventId, String code);
    List<Discount> findByEventId(Long eventId);
}
