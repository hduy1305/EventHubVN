package com.example.order_service.feign_client;

import com.example.order_service.dto.DiscountDto;
import com.example.order_service.dto.EventDto;
import com.example.order_service.dto.TicketTypeDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@FeignClient(name = "event-service", url = "${event.service-url}")
public interface EventServiceClient {

    @GetMapping("/api/events/{eventId}")
    EventDto getEventById(@PathVariable("eventId") Long eventId);

    @GetMapping("/api/events/ticket-types/{id}")
    TicketTypeDto getTicketTypeById(@PathVariable("id") Long id);

    @GetMapping("/api/events/{eventId}/discounts/validate")
    Optional<DiscountDto> validateDiscountCode(@PathVariable("eventId") Long eventId, @RequestParam("code") String code);

    @PostMapping("/api/events/discounts/{discountId}/increment-usage")
    void incrementDiscountUsedCount(@PathVariable("discountId") Long discountId);

    @PostMapping("/api/events/ticket-types/{id}/decrement-quota")
    void decrementTicketQuota(@PathVariable("id") Long ticketTypeId, @RequestParam("quantity") Integer quantity);
}
