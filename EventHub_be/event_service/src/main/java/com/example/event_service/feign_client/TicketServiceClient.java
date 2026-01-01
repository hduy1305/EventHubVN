package com.example.event_service.feign_client;

import com.example.event_service.dto.TicketConfigSyncRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ticket-service", url = "${ticket.service-url}")
public interface TicketServiceClient {
    @PostMapping("/api/tickets/config-sync")
    void syncTicketConfig(@RequestBody TicketConfigSyncRequest request);
}
