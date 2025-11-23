package com.example.order_service.controller;

import com.example.order_service.dto.ReservationRequest;
import com.example.order_service.model.Reservation;
import com.example.order_service.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<Reservation> reserve(@RequestBody ReservationRequest req) {
        return ResponseEntity.ok(reservationService.reserve(req));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getByUser(userId));
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Void> cleanup() {
        reservationService.cleanupExpired();
        return ResponseEntity.noContent().build();
    }
}
