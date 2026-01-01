package com.example.auth_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Only ADMINs can access these endpoints
public class AdminController {
    // This controller can be used for other admin-specific tasks,
    // but user/role creation is now handled through AuthService and OrganizationService.
    // The previous methods for creating organizers and admins are removed
    // as they relied on a global role assignment mechanism that has been replaced
    // by organization-specific roles.
}
