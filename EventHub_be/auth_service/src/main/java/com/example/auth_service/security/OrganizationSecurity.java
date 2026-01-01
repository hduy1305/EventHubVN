package com.example.auth_service.security;

import com.example.auth_service.model.User;
import com.example.auth_service.model.UserOrganizationRole;
import com.example.auth_service.repository.UserOrganizationRoleRepository;
import com.example.auth_service.service.OrganizationService;
import com.example.auth_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component("organizationSecurity")
@RequiredArgsConstructor
public class OrganizationSecurity {

    private final OrganizationService organizationService;
    private final UserService userService;
    private final UserOrganizationRoleRepository userOrganizationRoleRepository; // Inject UserOrganizationRoleRepository

    public boolean isMemberOfOrganization(UUID organizationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userEmail = authentication.getName();
        Optional<User> userOptional = userService.getUserByEmail(userEmail);
        if (userOptional.isEmpty()) {
            return false;
        }
        User currentUser = userOptional.get();

        // Check if the user has any role within the specified organization
        return organizationService.getUserOrganizationsAndRoles(currentUser.getId()).stream()
                .anyMatch(uor -> uor.getOrganization().getId().equals(organizationId));
    }

    public boolean isOwnerOfOrganization(UUID organizationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userEmail = authentication.getName();
        Optional<User> userOptional = userService.getUserByEmail(userEmail);
        if (userOptional.isEmpty()) {
            return false;
        }
        User currentUser = userOptional.get();

        return organizationService.getOrganizationById(organizationId)
                .map(org -> org.getOwner().getId().equals(currentUser.getId()))
                .orElse(false);
    }

    public boolean isOwnerOfUserOrganizationRole(Long userOrganizationRoleId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userEmail = authentication.getName();
        Optional<User> userOptional = userService.getUserByEmail(userEmail);
        if (userOptional.isEmpty()) {
            return false;
        }
        User currentUser = userOptional.get();

        Optional<UserOrganizationRole> uorOptional = userOrganizationRoleRepository.findById(userOrganizationRoleId);
        if (uorOptional.isEmpty()) {
            return false;
        }
        UserOrganizationRole uor = uorOptional.get();

        // Check if the current user is the owner of the organization this UOR belongs to
        return uor.getOrganization().getOwner().getId().equals(currentUser.getId());
    }
}
