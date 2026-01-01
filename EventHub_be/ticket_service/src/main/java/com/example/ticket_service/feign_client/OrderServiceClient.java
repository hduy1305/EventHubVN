package com.example.ticket_service.feign_client;

import com.example.ticket_service.dto.OrderDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "order-service", url = "${order.service-url}")
public interface OrderServiceClient {

    @GetMapping("/api/internal/orders/{id}")
    OrderDetailsDto getOrderById(@PathVariable("id") Long id);
}
