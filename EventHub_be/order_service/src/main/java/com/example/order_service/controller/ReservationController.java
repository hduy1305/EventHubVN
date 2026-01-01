package com.example.order_service.controller;

import com.example.order_service.dto.ReservationDto;
import com.example.order_service.dto.ReservationRequest;
import com.example.order_service.model.Reservation;
import com.example.order_service.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reservation> reserve(@RequestBody ReservationRequest req) {
        return ResponseEntity.ok(reservationService.reserve(req));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Add security if needed
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #userId") // Assuming principal has ID
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reservationService.getByUser(userId));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == @reservationSecurity.getReservation(#id).userId") // Assuming reservationSecurity bean
    public ResponseEntity<Reservation> confirmReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == @reservationSecurity.getReservation(#id).userId")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }

    @PostMapping("/cleanup-expired")
    @PreAuthorize("hasRole('ADMIN')") // Only admin can trigger cleanup
    public ResponseEntity<Void> cleanupExpired() {
        reservationService.cleanupExpired();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seat-availability/{seatId}")
    public ResponseEntity<Boolean> checkSeatAvailability(@PathVariable Long seatId) {
        return ResponseEntity.ok(reservationService.isSeatAvailable(seatId));
    }

    // New endpoint for event_service to get active reservations
    @GetMapping("/event/{eventId}/active")
    public ResponseEntity<List<ReservationDto>> getActiveReservationsForEvent(@PathVariable Long eventId) {
        List<Reservation> activeReservations = reservationService.getActiveReservationsForEvent(eventId);
        List<ReservationDto> dtos = activeReservations.stream()
                .map(res -> ReservationDto.builder()
                        .id(res.getId())
                        .userId(res.getUserId())
                        .eventId(res.getEventId())
                        .ticketTypeId(res.getTicketTypeId())
                        .seatId(res.getSeatId())
                        .quantity(res.getQuantity())
                        .expireAt(res.getExpireAt())
                        .status(res.getStatus().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // --- Shopping Cart-like Endpoints ---

    @PostMapping("/cart")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #request.userId")
    public ResponseEntity<Reservation> addOrUpdateCartItem(@RequestBody ReservationRequest request) {
        // In a real app, userId should be extracted from authenticated principal
        return ResponseEntity.ok(reservationService.addOrUpdateCartItem(
                request.getUserId(), request.getEventId(), request.getTicketTypeId(), request.getSeatId(), request.getQuantity()
        ));
    }

    @DeleteMapping("/cart/{reservationId}")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == @reservationSecurity.getReservation(#reservationId).userId")
    public ResponseEntity<Void> removeCartItem(@PathVariable Long reservationId) {
        reservationService.removeCartItem(reservationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cart/user/{userId}")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #userId")
    public ResponseEntity<List<ReservationDto>> getCartItemsForUser(@PathVariable UUID userId) {
        List<Reservation> cartItems = reservationService.getCartItemsForUser(userId);
        List<ReservationDto> dtos = cartItems.stream()
                .map(res -> ReservationDto.builder()
                        .id(res.getId())
                        .userId(res.getUserId())
                        .eventId(res.getEventId())
                        .ticketTypeId(res.getTicketTypeId())
                        .seatId(res.getSeatId())
                        .quantity(res.getQuantity())
                        .expireAt(res.getExpireAt())
                        .status(res.getStatus().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
