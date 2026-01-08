package com.example.order_service.feign_client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "ticket-service", url = "${ticket.service-url}")
public interface TicketServiceClient {
    @GetMapping("/api/tickets/user/{userId}/ticket-type/{ticketTypeId}/count")
    Long countUserTicketsByType(@PathVariable String userId, @PathVariable Long ticketTypeId);
}
