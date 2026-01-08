package com.example.order_service.service;

import com.example.order_service.dto.ReservationRequest;
import com.example.order_service.dto.TicketTypeDto;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.feign_client.TicketServiceClient;
import com.example.order_service.model.Reservation;
import com.example.order_service.model.Reservation.ReservationStatus;
import com.example.order_service.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final EventServiceClient eventServiceClient;
    private final TicketServiceClient ticketServiceClient;

    @Transactional
    public Reservation reserve(ReservationRequest request) {
        if (request.getSeatId() != null) {
            // Check if the specific seat is already reserved (PENDING or CONFIRMED)
            Optional<Reservation> existingReservation = reservationRepository.findBySeatIdAndStatus(request.getSeatId(), ReservationStatus.PENDING);
            if (existingReservation.isPresent()) {
                throw new RuntimeException("Seat " + request.getSeatId() + " is already reserved.");
            }
            // Also check for CONFIRMED status if a seat can be confirmed without an order being fully paid yet
            Optional<Reservation> confirmedReservation = reservationRepository.findBySeatIdAndStatus(request.getSeatId(), ReservationStatus.CONFIRMED);
            if (confirmedReservation.isPresent()) {
                throw new RuntimeException("Seat " + request.getSeatId() + " is already confirmed.");
            }
        }

        // Check purchase limit
        TicketTypeDto ticketType = eventServiceClient.getTicketTypeById(request.getTicketTypeId());
        if (ticketType.getPurchaseLimit() != null && ticketType.getPurchaseLimit() > 0) {
            // Count already purchased tickets
            Long purchasedCount = ticketServiceClient.countUserTicketsByType(request.getUserId().toString(), request.getTicketTypeId());
            if (purchasedCount == null) purchasedCount = 0L;

            // Count pending reservations
            List<Reservation> userReservations = reservationRepository.findByUserIdAndStatusAndExpireAtAfter(request.getUserId(), ReservationStatus.PENDING, LocalDateTime.now());
            long reservedCount = userReservations.stream()
                    .filter(r -> r.getTicketTypeId().equals(request.getTicketTypeId()))
                    .mapToInt(Reservation::getQuantity)
                    .sum();

            if (purchasedCount + reservedCount + request.getQuantity() > ticketType.getPurchaseLimit()) {
                throw new RuntimeException("Purchase limit exceeded. Limit is " + ticketType.getPurchaseLimit() + ". You have already bought/reserved " + (purchasedCount + reservedCount) + " tickets.");
            }
        }

        // Check sale time window
        LocalDateTime now = LocalDateTime.now();
        if (ticketType.getStartSale() != null && now.isBefore(ticketType.getStartSale())) {
            throw new RuntimeException("Sale for this ticket type has not started yet. Sales start at: " + ticketType.getStartSale());
        }
        if (ticketType.getEndSale() != null && now.isAfter(ticketType.getEndSale())) {
            throw new RuntimeException("Sale for this ticket type has ended. Sales ended at: " + ticketType.getEndSale());
        }

        Reservation res = Reservation.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .ticketTypeId(request.getTicketTypeId())
                .seatId(request.getSeatId()) // Set the seatId
                .quantity(request.getQuantity())
                .expireAt(LocalDateTime.now().plusMinutes(5)) // 5-minute countdown
                .status(ReservationStatus.PENDING) // Initial status
                .build();
        return reservationRepository.save(res);
    }

    public List<Reservation> getByUser(UUID userId) {
        return reservationRepository.findByUserId(userId);
    }

    public Optional<Reservation> getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId);
    }

    @Transactional
    public Reservation confirmReservation(Long reservationId) {
        Reservation reservation = getReservationById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (reservation.getStatus() == ReservationStatus.PENDING && reservation.getExpireAt().isAfter(LocalDateTime.now())) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
            return reservationRepository.save(reservation);
        } else {
            throw new RuntimeException("Cannot confirm reservation. It might be expired or already processed.");
        }
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        Reservation reservation = getReservationById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (reservation.getStatus() == ReservationStatus.PENDING || reservation.getStatus() == ReservationStatus.CONFIRMED) {
            reservation.setStatus(ReservationStatus.CANCELLED);
            return reservationRepository.save(reservation);
        } else {
            throw new RuntimeException("Cannot cancel reservation with status: " + reservation.getStatus());
        }
    }

    @Transactional
    public void cleanupExpired() {
        List<Reservation> expiredPendingReservations = reservationRepository.findByExpireAtBeforeAndStatus(LocalDateTime.now(), ReservationStatus.PENDING);
        for (Reservation res : expiredPendingReservations) {
            res.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(res);
        }
    }

    public boolean isSeatAvailable(Long seatId) {
        if (seatId == null) {
            return true; // If no specific seat is requested, it's considered available for general reservation
        }
        // A seat is available if there are no PENDING or CONFIRMED reservations for it
        return reservationRepository.findBySeatIdAndStatus(seatId, ReservationStatus.PENDING).isEmpty() &&
               reservationRepository.findBySeatIdAndStatus(seatId, ReservationStatus.CONFIRMED).isEmpty();
    }

    public List<Reservation> getActiveReservationsForEvent(Long eventId) {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> pending = reservationRepository.findByEventIdAndStatus(eventId, ReservationStatus.PENDING).stream()
                .filter(res -> res.getExpireAt().isAfter(now))
                .collect(Collectors.toList());
        List<Reservation> confirmed = reservationRepository.findByEventIdAndStatus(eventId, ReservationStatus.CONFIRMED);
        pending.addAll(confirmed);
        return pending;
    }

    // --- Shopping Cart-like functionality ---

    @Transactional
    public Reservation addOrUpdateCartItem(UUID userId, Long eventId, Long ticketTypeId, Long seatId, Integer quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive.");
        }

        // --- Purchase Limit Check ---
        TicketTypeDto ticketType = eventServiceClient.getTicketTypeById(ticketTypeId);
        if (ticketType.getPurchaseLimit() != null && ticketType.getPurchaseLimit() > 0) {
            Long purchasedCount = ticketServiceClient.countUserTicketsByType(userId.toString(), ticketTypeId);
            if (purchasedCount == null) purchasedCount = 0L;

            // First, check if a PENDING reservation already exists for this item
            Optional<Reservation> existingCartItemCheck = reservationRepository.findByUserIdAndEventIdAndTicketTypeIdAndSeatIdAndStatus(
                    userId, eventId, ticketTypeId, seatId, ReservationStatus.PENDING
            );

            // Get the ID of the existing reservation if it exists, to exclude it from the count
            Long existingReservationId = existingCartItemCheck.map(Reservation::getId).orElse(null);

            List<Reservation> userReservations = reservationRepository.findByUserIdAndStatusAndExpireAtAfter(userId, ReservationStatus.PENDING, LocalDateTime.now());
            long reservedCount = userReservations.stream()
                    .filter(r -> r.getTicketTypeId().equals(ticketTypeId))
                    .filter(r -> !r.getId().equals(existingReservationId)) // Exclude the current reservation if it's an update
                    .mapToInt(Reservation::getQuantity)
                    .sum();
            
            // Calculate total quantity including current request
            long newTotalQuantity = purchasedCount + reservedCount + quantity;

            if (newTotalQuantity > ticketType.getPurchaseLimit()) {
                throw new RuntimeException("Purchase limit exceeded. Limit is " + ticketType.getPurchaseLimit() + ". You have already bought/reserved " + (purchasedCount + reservedCount) + " tickets.");
            }
        }
        // --- End Purchase Limit Check ---

        // Check sale time window
        LocalDateTime now = LocalDateTime.now();
        if (ticketType.getStartSale() != null && now.isBefore(ticketType.getStartSale())) {
            throw new RuntimeException("Sale for this ticket type has not started yet. Sales start at: " + ticketType.getStartSale());
        }
        if (ticketType.getEndSale() != null && now.isAfter(ticketType.getEndSale())) {
            throw new RuntimeException("Sale for this ticket type has ended. Sales ended at: " + ticketType.getEndSale());
        }

        // Check if a PENDING reservation already exists for this item (re-declared for scope)
        Optional<Reservation> existingCartItem = reservationRepository.findByUserIdAndEventIdAndTicketTypeIdAndSeatIdAndStatus(
                userId, eventId, ticketTypeId, seatId, ReservationStatus.PENDING
        );

        Reservation reservation;
        if (existingCartItem.isPresent()) {
            reservation = existingCartItem.get();
            reservation.setQuantity(quantity);
            reservation.setExpireAt(LocalDateTime.now().plusMinutes(5)); // Reset countdown
        } else {
            // Check seat availability for new reservation
            if (seatId != null && !isSeatAvailable(seatId)) {
                throw new RuntimeException("Seat " + seatId + " is not available.");
            }
            reservation = Reservation.builder()
                    .userId(userId)
                    .eventId(eventId)
                    .ticketTypeId(ticketTypeId)
                    .seatId(seatId)
                    .quantity(quantity)
                    .expireAt(LocalDateTime.now().plusMinutes(5))
                    .status(ReservationStatus.PENDING)
                    .build();
        }
        return reservationRepository.save(reservation);
    }

    @Transactional
    public void removeCartItem(Long reservationId) {
        Reservation reservation = getReservationById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        if (reservation.getStatus() == ReservationStatus.PENDING) {
            reservation.setStatus(ReservationStatus.CANCELLED); // Mark as cancelled
            reservationRepository.save(reservation);
        } else {
            throw new RuntimeException("Cannot remove non-pending reservation from cart.");
        }
    }

    public List<Reservation> getCartItemsForUser(UUID userId) {
        return reservationRepository.findByUserIdAndStatusAndExpireAtAfter(userId, ReservationStatus.PENDING, LocalDateTime.now());
    }
}
