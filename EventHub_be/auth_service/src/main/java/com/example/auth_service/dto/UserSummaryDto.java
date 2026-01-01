package com.example.auth_service.dto;

import com.example.auth_service.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryDto {
    private String id;
    private String email;
    private String fullName;

    public static UserSummaryDto fromEntity(User user) {
        return UserSummaryDto.builder()
                .id(user.getId() != null ? user.getId().toString() : null)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
