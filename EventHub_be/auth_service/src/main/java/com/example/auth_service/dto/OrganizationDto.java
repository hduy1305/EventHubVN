package com.example.auth_service.dto;

import com.example.auth_service.model.Organization;
import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Builder
public class OrganizationDto {
    private UUID id;
    private String name;
    private String description;
    private String contactEmail;
    private String status;
    private UUID ownerId;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public static OrganizationDto fromEntity(Organization org) {
        return OrganizationDto.builder()
                .id(org.getId())
                .name(org.getName())
                .description(org.getDescription())
                .contactEmail(org.getContactEmail())
                .status(org.getStatus() != null ? org.getStatus().name() : null)
                .ownerId(org.getOwner() != null ? org.getOwner().getId() : null)
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt())
                .build();
    }
}
