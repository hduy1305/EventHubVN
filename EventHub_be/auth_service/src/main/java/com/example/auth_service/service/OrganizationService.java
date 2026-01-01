package com.example.auth_service.service;

import com.example.auth_service.dto.OrganizationResponse;
import com.example.auth_service.model.*;
import com.example.auth_service.repository.OrganizationRepository;
import com.example.auth_service.repository.RoleRepository;
import com.example.auth_service.repository.UserOrganizationRoleRepository;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserOrganizationRoleRepository userOrganizationRoleRepository;

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public Optional<Organization> getOrganizationById(UUID id) {
        return organizationRepository.findById(id);
    }

    public List<Organization> getOrganizationsByOwner(UUID ownerId) {
        return organizationRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public OrganizationResponse createOrganization(Organization organization, UUID ownerUserId) {
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new RuntimeException("Owner user not found with id: " + ownerUserId));
        organization.setOwner(owner);
        organization.setStatus(OrganizationStatus.ACTIVE); // Default status
        Organization savedOrganization = organizationRepository.save(organization);

        // Assign the owner an 'ORGANIZER' role within their new organization
        Role organizerRole = roleRepository.findByName("ORGANIZER")
                .orElseThrow(() -> new RuntimeException("ORGANIZER role not found. Please ensure it exists."));

        UserOrganizationRole userOrgRole = UserOrganizationRole.builder()
                .user(owner)
                .organization(savedOrganization)
                .role(organizerRole)
                .build();
        userOrganizationRoleRepository.save(userOrgRole);

        return OrganizationResponse.fromEntity(savedOrganization); // Convert to DTO
    }

    @Transactional
    public Organization updateOrganization(UUID id, Organization updatedOrganization) {
        Organization existingOrganization = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
        existingOrganization.setName(updatedOrganization.getName());
        existingOrganization.setStatus(updatedOrganization.getStatus());
        existingOrganization.setCancellationPolicy(updatedOrganization.getCancellationPolicy());
        existingOrganization.setRefundPolicy(updatedOrganization.getRefundPolicy());
        existingOrganization.setSupportedPaymentMethods(updatedOrganization.getSupportedPaymentMethods());
        existingOrganization.setFeesAndTaxes(updatedOrganization.getFeesAndTaxes());
        return organizationRepository.save(existingOrganization);
    }

    @Transactional
    public void deleteOrganization(UUID id) {
        if (!organizationRepository.existsById(id)) {
            throw new RuntimeException("Organization not found with id: " + id);
        }
        organizationRepository.deleteById(id);
    }

    @Transactional
    public UserOrganizationRole addUserToOrganization(UUID organizationId, UUID userId, Long roleId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + roleId));

        // Check if user already has a role in this organization
        userOrganizationRoleRepository.findByUserIdAndOrganizationId(userId, organizationId).stream().findFirst()
                .ifPresent(r -> { throw new RuntimeException("User already has a role in this organization."); });

        UserOrganizationRole userOrgRole = UserOrganizationRole.builder()
                .user(user)
                .organization(organization)
                .role(role)
                .build();
        return userOrganizationRoleRepository.save(userOrgRole);
    }

    @Transactional
    public UserOrganizationRole addUserToOrganizationByRoleName(UUID organizationId, UUID userId, String roleName) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + organizationId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found with name: " + roleName));

        userOrganizationRoleRepository.findByUserIdAndOrganizationId(userId, organizationId).stream().findFirst()
                .ifPresent(r -> { throw new RuntimeException("User already has a role in this organization."); });

        UserOrganizationRole userOrgRole = UserOrganizationRole.builder()
                .user(user)
                .organization(organization)
                .role(role)
                .build();
        return userOrganizationRoleRepository.save(userOrgRole);
    }

    @Transactional
    public UserOrganizationRole updateUserOrganizationRole(Long userOrgRoleId, Long newRoleId) {
        UserOrganizationRole userOrgRole = userOrganizationRoleRepository.findById(userOrgRoleId)
                .orElseThrow(() -> new RuntimeException("UserOrganizationRole not found with id: " + userOrgRoleId));
        Role newRole = roleRepository.findById(newRoleId)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + newRoleId));
        userOrgRole.setRole(newRole);
        return userOrganizationRoleRepository.save(userOrgRole);
    }

    @Transactional
    public void removeUserFromOrganization(Long userOrgRoleId) {
        if (!userOrganizationRoleRepository.existsById(userOrgRoleId)) {
            throw new RuntimeException("UserOrganizationRole not found with id: " + userOrgRoleId);
        }
        userOrganizationRoleRepository.deleteById(userOrgRoleId);
    }

    public List<UserOrganizationRole> getUserRolesInOrganization(UUID organizationId) {
        return userOrganizationRoleRepository.findByOrganizationId(organizationId);
    }

    public List<UserOrganizationRole> getUserOrganizationsAndRoles(UUID userId) {
        return userOrganizationRoleRepository.findByUserId(userId);
    }
}
