package com.example.auth_service.service;

import com.example.auth_service.adapter.UserDetailsAdapter;
import com.example.auth_service.model.User;
import com.example.auth_service.model.UserOrganizationRole;
import com.example.auth_service.repository.UserOrganizationRoleRepository;
import com.example.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final UserOrganizationRoleRepository userOrganizationRoleRepository;

    @Override
    @Transactional(readOnly = true) // Ensure lazy loading works if needed
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Collect all role names (e.g., "ADMIN", "ORGANIZER")
        Set<String> roleNames = new HashSet<>();
        List<UserOrganizationRole> userOrgRoles = userOrganizationRoleRepository.findByUserId(user.getId());

        // This is safe within the @Transactional(readOnly = true) context
        for (UserOrganizationRole uor : userOrgRoles) {
            roleNames.add(uor.getRole().getName()); // e.g., "ORGANIZER"
            // If you also want permissions as separate authorities, you'd collect them here:
            // uor.getRole().getPermissions().stream()
            // .map(Permission::getName)
            // .forEach(permissionName -> authorities.add(new SimpleGrantedAuthority(permissionName)));
        }

        return new UserDetailsAdapter(user, roleNames); // Return our custom adapter
    }
}
