package com.example.auth_service.service;

import com.example.auth_service.adapter.UserDetailsAdapter;
import com.example.auth_service.dto.JwtResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.dto.SignupRequest;
import com.example.auth_service.model.Permission;
import com.example.auth_service.model.User;
import com.example.auth_service.model.UserOrganizationRole;
import com.example.auth_service.model.UserStatus;
import com.example.auth_service.repository.RoleRepository;
import com.example.auth_service.repository.UserOrganizationRoleRepository;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo; // Still needed for initial role creation if any, or for fetching roles by ID
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final UserOrganizationRoleRepository userOrganizationRoleRepository;
    private final OrganizationService organizationService; // To get organization details

    public User registerUser(SignupRequest req) { // Removed roleName parameter
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        User u = new User();
        u.setEmail(req.getEmail());
        u.setFullName(req.getFullName());
        u.setPasswordHash(encoder.encode(req.getPassword()));
        u.setStatus(UserStatus.ACTIVE);
        return userRepo.save(u);
    }

    // Removed assignRoleToUser as roles are now organization-specific

    @Transactional
    public JwtResponse authenticateUser(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch user's roles within organizations directly from repository
                        List<UserOrganizationRole> userOrgRoles = userOrganizationRoleRepository.findByUserId(u.getId());
                
                        Set<String> allRoles = new HashSet<>();
                        Set<String> allPermissions = new HashSet<>();
                        List<JwtResponse.UserOrganizationRoleDto> orgRoleDtos = new ArrayList<>();
                
                        for (UserOrganizationRole uor : userOrgRoles) {
                            allRoles.add(uor.getRole().getName()); // Ensure all roles are still collected
                
                            Set<String> rolePermissions = new HashSet<>();
                            for (Permission permission : uor.getRole().getPermissions()) {
                                rolePermissions.add(permission.getName());
                            }
                            allPermissions.addAll(rolePermissions);
                
                            orgRoleDtos.add(JwtResponse.UserOrganizationRoleDto.builder()
                                    .organizationId(uor.getOrganization().getId())
                                    .organizationName(uor.getOrganization().getName())
                                    .roleName(uor.getRole().getName())
                                    .permissions(new ArrayList<>(rolePermissions))
                                    .build());
                        }
                
                        UserDetails userDetails = new UserDetailsAdapter(u, allRoles); // Pass allRoles
                        String access = jwtService.generateAccessTokenWithOrgRoles(userDetails, orgRoleDtos, new ArrayList<>(allPermissions));
        String refresh = jwtService.generateRefreshToken(userDetails);

            return JwtResponse.builder()
                    .accessToken(access)
                    .refreshToken(refresh)
                    .tokenType("Bearer")
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .roles(new ArrayList<>(allRoles))
                    .permissions(new ArrayList<>(allPermissions))
                    .organizationRoles(orgRoleDtos)
                    .build();
    }

    @Transactional
    public JwtResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch user's roles within organizations directly from repository
                                List<UserOrganizationRole> userOrgRoles = userOrganizationRoleRepository.findByUserId(user.getId());
                                
                                Set<String> allRoles = new HashSet<>();
                                Set<String> allPermissions = new HashSet<>();
                                List<JwtResponse.UserOrganizationRoleDto> orgRoleDtos = new ArrayList<>();
                        
                                for (UserOrganizationRole uor : userOrgRoles) {
                                    allRoles.add(uor.getRole().getName()); // Ensure all roles are still collected
                        
                                    Set<String> rolePermissions = new HashSet<>();
                                    for (Permission permission : uor.getRole().getPermissions()) {
                                        rolePermissions.add(permission.getName());
                                    }
                                    allPermissions.addAll(rolePermissions);
                        
                                    orgRoleDtos.add(JwtResponse.UserOrganizationRoleDto.builder()
                                            .organizationId(uor.getOrganization().getId())
                                            .organizationName(uor.getOrganization().getName())
                                            .roleName(uor.getRole().getName())
                                            .permissions(new ArrayList<>(rolePermissions))
                                            .build());
                                }
                        
                                UserDetails userDetails = new UserDetailsAdapter(user, allRoles); // Pass allRoles
                                String newAccess = jwtService.generateAccessTokenWithOrgRoles(userDetails, orgRoleDtos, new ArrayList<>(allPermissions));
                    return JwtResponse.builder()
                            .accessToken(newAccess)
                            .refreshToken(refreshToken)
                            .tokenType("Bearer")
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .roles(new ArrayList<>(allRoles))
                            .permissions(new ArrayList<>(allPermissions))
                            .organizationRoles(orgRoleDtos)
                            .build();    }
}
