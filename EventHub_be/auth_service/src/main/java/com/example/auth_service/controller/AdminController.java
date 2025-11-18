package com.example.auth_service.controller;

import com.example.auth_service.dto.JwtResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.SignupRequest;
import com.example.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AuthService authService;

    @PostMapping("/create-organizer")
    public ResponseEntity<?> registerStaff(@RequestBody SignupRequest request) {
        authService.registerUser(request, "ORGANIZER");
        return ResponseEntity.ok("Registration successful");
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody SignupRequest request) {
        authService.registerUser(request, "ADMIN");
        return ResponseEntity.ok("Registration successful");
    }
}

