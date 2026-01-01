package com.example.ticket_service.feign_client;

import com.example.ticket_service.dto.EventDetailsDto;
import com.example.ticket_service.dto.TicketTypeDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-service", url = "${event.service-url}")
public interface EventServiceClient {

    @GetMapping("/api/events/{id}")
    EventDetailsDto getEventById(@PathVariable("id") Long id);

    @GetMapping("/api/events/ticket-types/{id}")
    TicketTypeDetailsDto getTicketTypeById(@PathVariable("id") Long id);
}
