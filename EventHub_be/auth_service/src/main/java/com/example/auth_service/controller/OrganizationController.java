package com.example.auth_service.controller;

import com.example.auth_service.dto.OrganizationDto;
import com.example.auth_service.dto.OrganizationResponse;
import com.example.auth_service.dto.UserOrganizationRoleDto;
import com.example.auth_service.model.Organization;
import com.example.auth_service.model.UserOrganizationRole;
import com.example.auth_service.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can view all organizations
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations().stream()
                .map(OrganizationDto::fromEntity)
                .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isMemberOfOrganization(#id)") // ADMIN or member
    public ResponseEntity<Organization> getOrganizationById(@PathVariable UUID id) {
        return organizationService.getOrganizationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()") // Any authenticated user can create an organization
    public ResponseEntity<OrganizationResponse> createOrganization(@RequestBody Organization organization, @RequestParam UUID ownerUserId) {
        // In a real app, ownerUserId would come from the authenticated user's context
        return ResponseEntity.ok(organizationService.createOrganization(organization, ownerUserId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isOwnerOfOrganization(#id)") // ADMIN or owner
    public ResponseEntity<Organization> updateOrganization(@PathVariable UUID id, @RequestBody Organization organization) {
        return ResponseEntity.ok(organizationService.updateOrganization(id, organization));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can delete organizations
    public ResponseEntity<Void> deleteOrganization(@PathVariable UUID id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoints for managing users within organizations

    @PostMapping("/{organizationId}/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isOwnerOfOrganization(#organizationId)") // ADMIN or owner
    public ResponseEntity<UserOrganizationRole> addUserToOrganization(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId,
            @PathVariable Long roleId) {
        return ResponseEntity.ok(organizationService.addUserToOrganization(organizationId, userId, roleId));
    }

    @PostMapping("/{organizationId}/users/{userId}/roles/by-name")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isOwnerOfOrganization(#organizationId)")
    public ResponseEntity<UserOrganizationRole> addUserToOrganizationByRoleName(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId,
            @RequestParam("roleName") String roleName) {
        return ResponseEntity.ok(organizationService.addUserToOrganizationByRoleName(organizationId, userId, roleName));
    }

    @PutMapping("/user-organization-roles/{userOrgRoleId}/roles/{newRoleId}")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isOwnerOfUserOrganizationRole(#userOrgRoleId)") // ADMIN or owner of the organization associated with the role
    public ResponseEntity<UserOrganizationRole> updateUserOrganizationRole(
            @PathVariable Long userOrgRoleId,
            @PathVariable Long newRoleId) {
        return ResponseEntity.ok(organizationService.updateUserOrganizationRole(userOrgRoleId, newRoleId));
    }

    @DeleteMapping("/user-organization-roles/{userOrgRoleId}")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isOwnerOfUserOrganizationRole(#userOrgRoleId)") // ADMIN or owner of the organization associated with the role
    public ResponseEntity<Void> removeUserFromOrganization(@PathVariable Long userOrgRoleId) {
        organizationService.removeUserFromOrganization(userOrgRoleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{organizationId}/users-roles")
    @PreAuthorize("hasRole('ADMIN') or @organizationSecurity.isMemberOfOrganization(#organizationId)") // ADMIN or member
    public ResponseEntity<List<UserOrganizationRoleDto>> getUsersAndRolesInOrganization(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(
                organizationService.getUserRolesInOrganization(organizationId)
                        .stream()
                        .map(UserOrganizationRoleDto::fromEntity)
                        .toList()
        );
    }

    @GetMapping("/user/{userId}/organizations-roles")
    @PreAuthorize("authentication.principal.id == #userId or hasRole('ADMIN')") // User themselves or ADMIN
    public ResponseEntity<List<UserOrganizationRoleDto>> getUserOrganizationsAndRoles(@PathVariable UUID userId) {
        return ResponseEntity.ok(
                organizationService.getUserOrganizationsAndRoles(userId)
                        .stream()
                        .map(UserOrganizationRoleDto::fromEntity)
                        .toList()
        );
    }
}
