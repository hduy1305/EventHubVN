package com.example.ticket_service.feign_client;

import com.example.ticket_service.dto.EventDetailsDto;
import com.example.ticket_service.dto.ShowtimeDetailsDto;
import com.example.ticket_service.dto.TicketTypeDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "event-service", url = "${event.service-url}")
public interface EventServiceClient {

    @GetMapping("/api/events/{id}")
    EventDetailsDto getEventById(@PathVariable("id") Long id);

    @GetMapping("/api/events/ticket-types/{id}")
    TicketTypeDetailsDto getTicketTypeById(@PathVariable("id") Long id);
    
    @GetMapping("/api/showtimes/{id}")
    ShowtimeDetailsDto getShowtimeById(@PathVariable("id") Long id);
    
    // Internal endpoint - no auth required
    @GetMapping("/api/showtimes/internal/{id}")
    ShowtimeDetailsDto getShowtimeByIdInternal(@PathVariable("id") Long id);
    
    @GetMapping("/api/showtimes/event/{eventId}/by-code")
    ShowtimeDetailsDto getShowtimeByCode(@PathVariable("eventId") Long eventId, @RequestParam("code") String code);
}
