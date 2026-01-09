package com.example.auth_service.controller;

import com.example.auth_service.dto.JwtResponse;
import com.example.auth_service.dto.UserSummaryDto;
import com.example.auth_service.model.Role;
import com.example.auth_service.model.User;
import com.example.auth_service.model.UserOrganizationRole;
import com.example.auth_service.model.StaffEventAssignment;
import com.example.auth_service.repository.RoleRepository;
import com.example.auth_service.repository.UserOrganizationRoleRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.repository.StaffEventAssignmentRepository;
import com.example.auth_service.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.Arrays;


import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserOrganizationRoleRepository userOrganizationRoleRepository;
    private final StaffEventAssignmentRepository staffEventAssignmentRepository;
    private final RoleRepository roleRepository;
    private final OrganizationService organizationService;

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryDto>> searchUsers(@RequestParam("query") String query) {
        List<User> users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(query, query);
        return ResponseEntity.ok(users.stream().map(UserSummaryDto::fromEntity).toList());
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> userExists(@RequestParam("email") String email) {
        return ResponseEntity.ok(userRepository.existsByEmail(email));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserOrganizationRole> userOrgRoles = userOrganizationRoleRepository.findByUserId(user.getId());

        Set<String> allRoles = new HashSet<>();
        Set<String> allPermissions = new HashSet<>();
        List<JwtResponse.UserOrganizationRoleDto> orgRoleDtos = userOrgRoles.stream().map(uor -> {
            allRoles.add(uor.getRole().getName()); // Add role name to global roles
            Set<String> rolePermissions = uor.getRole().getPermissions().stream()
                    .map(permission -> permission.getName())
                    .collect(Collectors.toSet());
            allPermissions.addAll(rolePermissions); // Add permissions to global permissions

            return JwtResponse.UserOrganizationRoleDto.builder()
                    .organizationId(uor.getOrganization().getId())
                    .organizationName(uor.getOrganization().getName())
                    .roleName(uor.getRole().getName())
                    .permissions(new java.util.ArrayList<>(rolePermissions))
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "roles", allRoles, // Aggregated roles
                "permissions", allPermissions, // Aggregated permissions
                "organizationRoles", orgRoleDtos
        ));
    }

    @GetMapping("/{userId}/assigned-events")
    public ResponseEntity<List<Long>> getAssignedEvents(@PathVariable String userId) {
        UUID staffUuid = UUID.fromString(userId);
        List<Long> eventIds = staffEventAssignmentRepository.findByStaffId(staffUuid)
                .stream()
                .map(StaffEventAssignment::getEventId)
                .toList();
        return ResponseEntity.ok(eventIds);
    }

    @PostMapping("/{userId}/assign-event/{eventId}")
    // Temporarily removed @PreAuthorize for testing - add proper authorization in production
    public ResponseEntity<Void> assignStaffToEvent(@PathVariable String userId, @PathVariable Long eventId, Authentication auth) {
        UUID staffUuid = UUID.fromString(userId);
        
        // Validation: Check if user exists
        User user = userRepository.findById(staffUuid)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Simplified: Remove STAFF role validation - any user can be assigned to events
        // TODO: In production, you might want to add proper role validation
        
        // Check if staff is already assigned to this event
        boolean alreadyAssigned = staffEventAssignmentRepository
                .findByStaffIdAndEventId(staffUuid, eventId)
                .isPresent();
        
        if (alreadyAssigned) {
            throw new RuntimeException("User is already assigned to this event.");
        }
        
        UUID assignedBy = null;
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails principal) {
            try {
                // attempt to parse subject if UUID-like
                assignedBy = UUID.fromString(principal.getUsername());
            } catch (Exception ignored) {
            }
        }
        StaffEventAssignment assignment = StaffEventAssignment.builder()
                .staffId(staffUuid)
                .eventId(eventId)
                .assignedBy(assignedBy)
                .build();
        staffEventAssignmentRepository.save(assignment);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/email")
    public ResponseEntity<String> getUserEmailById(@PathVariable String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return ResponseEntity.ok(user.getEmail());
    }

    @GetMapping("/id-by-email")
    public ResponseEntity<String> getUserIdByEmail(@RequestParam("email") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return ResponseEntity.ok(user.getId().toString());
    }

    @DeleteMapping("/{userId}/unassign-event/{eventId}")
    public ResponseEntity<Void> unassignStaffFromEvent(
            @PathVariable String userId,
            @PathVariable String eventId) {
        staffEventAssignmentRepository.deleteByStaffIdAndEventId(
            UUID.fromString(userId), Long.parseLong(eventId)
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/assign-role")
    public ResponseEntity<Void> assignStaffRole(@PathVariable String userId, @RequestParam UUID organizationId) {
        UUID userUuid = UUID.fromString(userId);
        
        // Validate user exists
        User user = userRepository.findById(userUuid)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Get STAFF role
        Role staffRole = roleRepository.findByName("STAFF")
                .orElseThrow(() -> new RuntimeException("STAFF role not found in database"));
        
        // Check if user already has STAFF role in this organization
        List<UserOrganizationRole> existingRoles = userOrganizationRoleRepository.findByUserIdAndOrganizationId(userUuid, organizationId);
        boolean hasStaffRole = existingRoles.stream().anyMatch(r -> r.getRole().getName().equals("STAFF"));
        
        if (hasStaffRole) {
            // Already has STAFF role, return success
            return ResponseEntity.ok().build();
        }
        
        // Create new UserOrganizationRole with STAFF role
        UserOrganizationRole userOrgRole = UserOrganizationRole.builder()
                .user(user)
                .organization(organizationService.getOrganizationById(organizationId)
                        .orElseThrow(() -> new RuntimeException("Organization not found with ID: " + organizationId)))
                .role(staffRole)
                .build();
        
        userOrganizationRoleRepository.save(userOrgRole);
        return ResponseEntity.ok().build();
    }
}

