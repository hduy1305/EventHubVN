package com.example.auth_service.controller;

import com.example.auth_service.dto.SignupRequest;
import com.example.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizer")
@RequiredArgsConstructor
public class OrganizationController {
    private final AuthService authService;

    @PostMapping("/create-staff")
    public ResponseEntity<?> registerStaff(@RequestBody SignupRequest request) {
        authService.registerUser(request, "STAFF");
        return ResponseEntity.ok("Registration successful");
    }
}

