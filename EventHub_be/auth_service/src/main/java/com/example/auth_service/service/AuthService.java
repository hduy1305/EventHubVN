package com.example.auth_service.service;

import com.example.auth_service.adapter.UserDetailsAdapter;
import com.example.auth_service.dto.JwtResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.SignupRequest;
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;
import com.example.auth_service.model.UserStatus;
import com.example.auth_service.repository.RoleRepository;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public void registerUser(SignupRequest req, String roleName) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        User u = new User();
        u.setEmail(req.getEmail());
        u.setFullName(req.getFullName());
        u.setPasswordHash(encoder.encode(req.getPassword()));
        u.setStatus(UserStatus.ACTIVE);
        userRepo.save(u);
        assignRoleToUser(u, roleName);
    }

    public void assignRoleToUser(User user, String roleName) {
        Role role = roleRepo.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    newRole.setDescription("Auto-created role: " + roleName);
                    return roleRepo.save(newRole);
                });

        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }

        user.getRoles().add(role);
        userRepo.save(user);
    }

    public JwtResponse authenticateUser(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails userDetails = new UserDetailsAdapter(u);
        String access = jwtService.generateAccessToken(userDetails);
        String refresh = jwtService.generateRefreshToken(userDetails);

        return new JwtResponse(access, refresh, "Bearer", u.getFullName(), u.getEmail(),
                u.getRoles().stream().map(Role::getName).toList());
    }

    public JwtResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails userDetails = new UserDetailsAdapter(user);
        String newAccess = jwtService.refreshAccessToken(refreshToken, userDetails);
        return JwtResponse.builder()
                .accessToken(newAccess)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .build();
    }
}

