package com.example.ticket_service.feign_client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "auth-service", url = "${auth.service-url}")
public interface AuthServiceClient {

    @GetMapping("/api/users/exists")
    boolean userExists(@RequestParam("email") String email);

    @GetMapping("/api/users/{userId}/assigned-events")
    List<Long> getAssignedEvents(@PathVariable String userId);

    @GetMapping("/api/users/id-by-email")
    String getUserIdByEmail(@RequestParam("email") String email);
}
