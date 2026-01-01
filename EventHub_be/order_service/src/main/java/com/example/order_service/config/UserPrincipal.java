package com.example.order_service.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Principal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal implements Principal {
    private UUID id;
    private String email;
    private String jwtToken; // Added JWT token field

    @Override
    public String getName() {
        return email;
    }
}
