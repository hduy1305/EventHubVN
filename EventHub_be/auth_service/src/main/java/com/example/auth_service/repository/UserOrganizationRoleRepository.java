package com.example.auth_service.repository;

import com.example.auth_service.model.UserOrganizationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserOrganizationRoleRepository extends JpaRepository<UserOrganizationRole, Long> {
    List<UserOrganizationRole> findByUserId(UUID userId);
    List<UserOrganizationRole> findByOrganizationId(UUID organizationId);
    List<UserOrganizationRole> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}
