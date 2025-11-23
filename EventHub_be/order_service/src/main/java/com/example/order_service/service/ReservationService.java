package com.example.order_service.service;

import com.example.order_service.dto.ReservationRequest;
import com.example.order_service.model.Reservation;
import com.example.order_service.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;

    public Reservation reserve(ReservationRequest request) {
        Reservation res = Reservation.builder()
                .userId(request.getUserId())
                .eventId(request.getEventId())
                .ticketTypeId(request.getTicketTypeId())
                .quantity(request.getQuantity())
                .expireAt(LocalDateTime.now().plusMinutes(5))
                .build();
        return reservationRepository.save(res);
    }

    public List<Reservation> getByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public void cleanupExpired() {
        reservationRepository.deleteByExpireAtBefore(LocalDateTime.now());
    }
}
