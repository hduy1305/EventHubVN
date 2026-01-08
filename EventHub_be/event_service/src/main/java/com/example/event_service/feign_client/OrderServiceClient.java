package com.example.event_service.feign_client;

import com.example.event_service.dto.ReservationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "order-service", url = "${order.service-url}")
public interface OrderServiceClient {

    @GetMapping("/api/reservations/event/{eventId}/active")
    List<ReservationDto> getActiveReservationsForEvent(@PathVariable("eventId") Long eventId);

    /**
     * Get total sold quantity for a ticket type in an event
     * Only counts PAID orders
     */
    @GetMapping("/api/orders/event/{eventId}/ticket-type/{ticketTypeId}/sold-count")
    Integer getSoldCountForTicketType(
        @PathVariable("eventId") Long eventId,
        @PathVariable("ticketTypeId") Long ticketTypeId
    );
}

