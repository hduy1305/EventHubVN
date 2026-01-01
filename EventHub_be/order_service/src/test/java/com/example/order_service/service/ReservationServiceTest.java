package com.example.order_service.service;

import com.example.order_service.dto.ReservationRequest;
import com.example.order_service.dto.TicketTypeDto;
import com.example.order_service.feign_client.EventServiceClient;
import com.example.order_service.model.Reservation;
import com.example.order_service.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private EventServiceClient eventServiceClient;

    @InjectMocks
    private ReservationService reservationService;

    private ReservationRequest request;
    private TicketTypeDto ticketType;

    @BeforeEach
    void setUp() {
        request = ReservationRequest.builder()
                .userId(UUID.fromString("123e4567-e89b-12d3-a456-426614174000"))
                .eventId(10L)
                .ticketTypeId(100L)
                .quantity(2)
                .build();

        ticketType = TicketTypeDto.builder()
                .id(100L)
                .purchaseLimit(5)
                .build();
    }

    @Test
    void reserve_Success_UnderLimit() {
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArguments()[0]);

        Reservation res = reservationService.reserve(request);
        
        assertNotNull(res);
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void reserve_Fail_OverLimit() {
        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}
