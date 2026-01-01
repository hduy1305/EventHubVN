package com.example.order_service.repository;

import com.example.order_service.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(UUID userId);
    void deleteByExpireAtBefore(LocalDateTime now);

    // New methods for more precise reservation management
    Optional<Reservation> findBySeatIdAndStatus(Long seatId, Reservation.ReservationStatus status);
    List<Reservation> findByEventIdAndStatus(Long eventId, Reservation.ReservationStatus status);
    List<Reservation> findByUserIdAndEventIdAndStatus(UUID userId, Long eventId, Reservation.ReservationStatus status);
    List<Reservation> findByExpireAtBeforeAndStatus(LocalDateTime now, Reservation.ReservationStatus status);

    // For shopping cart like functionality
    Optional<Reservation> findByUserIdAndEventIdAndTicketTypeIdAndSeatIdAndStatus(UUID userId, Long eventId, Long ticketTypeId, Long seatId, Reservation.ReservationStatus status);
    List<Reservation> findByUserIdAndStatusAndExpireAtAfter(UUID userId, Reservation.ReservationStatus status, LocalDateTime now);
}
