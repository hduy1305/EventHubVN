package com.example.auth_service.dto;

import com.example.auth_service.model.UserOrganizationRole;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserOrganizationRoleDto {
    private Long id;
    private UUID userId;
    private String userEmail;
    private String userName;
    private UUID organizationId;
    private Long roleId;
    private String roleName;
    private String roleDescription;

    public static UserOrganizationRoleDto fromEntity(UserOrganizationRole uor) {
        return UserOrganizationRoleDto.builder()
                .id(uor.getId())
                .userId(uor.getUser() != null ? uor.getUser().getId() : null)
                .userEmail(uor.getUser() != null ? uor.getUser().getEmail() : null)
                .userName(uor.getUser() != null ? uor.getUser().getFullName() : null)
                .organizationId(uor.getOrganization() != null ? uor.getOrganization().getId() : null)
                .roleId(uor.getRole() != null ? uor.getRole().getId() : null)
                .roleName(uor.getRole() != null ? uor.getRole().getName() : null)
                .roleDescription(uor.getRole() != null ? uor.getRole().getDescription() : null)
                .build();
    }
}
