package com.example.auth_service.dto;

import com.example.auth_service.model.Organization;
import com.example.auth_service.model.OrganizationStatus;
import com.example.auth_service.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {
    private UUID id;
    private String name;
    private String description;
    private String contactEmail;
    private UserDto owner; // Nested UserDto
    private OrganizationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrganizationResponse fromEntity(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .description(organization.getDescription())
                .contactEmail(organization.getContactEmail())
                .owner(UserDto.fromEntity(organization.getOwner())) // Convert owner User to UserDto
                .status(organization.getStatus())
                .createdAt(organization.getCreatedAt().toLocalDateTime())
                .updatedAt(organization.getUpdatedAt().toLocalDateTime())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private UUID id;
        private String email;
        private String fullName;

        public static UserDto fromEntity(User user) {
            if (user == null) return null;
            return UserDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .build();
        }
    }
}
