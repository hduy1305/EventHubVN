package com.example.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";

    private UUID id; // User ID
    private String fullName;
    private String email;
    private List<String> roles; // Global roles (if any, or can be removed)
    private List<String> permissions; // Aggregated permissions from all roles
    private List<UserOrganizationRoleDto> organizationRoles; // Roles within specific organizations

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserOrganizationRoleDto {
        private UUID organizationId;
        private String organizationName;
        private String roleName;
        private List<String> permissions;
    }
}
