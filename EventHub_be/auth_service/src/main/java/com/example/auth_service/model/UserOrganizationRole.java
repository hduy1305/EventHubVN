package com.example.auth_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_organization_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserOrganizationRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.EAGER) // Eagerly fetch role for authorization checks
    @JoinColumn(name = "role_id", nullable = false)
    private Role role; // Role specific to this organization (e.g., ORGANIZER, STAFF)
}
