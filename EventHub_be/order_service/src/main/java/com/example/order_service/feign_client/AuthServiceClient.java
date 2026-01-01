package com.example.order_service.feign_client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "auth-service", url = "${auth.service-url}")
public interface AuthServiceClient {

    @GetMapping("/api/users/{userId}/email")
    String getUserEmailById(@PathVariable("userId") UUID userId);
}
