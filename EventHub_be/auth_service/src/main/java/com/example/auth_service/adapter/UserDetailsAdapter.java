package com.example.auth_service.adapter;

import com.example.auth_service.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
public class UserDetailsAdapter implements UserDetails {
    private final User user;
    private final Set<String> roles; // Pre-processed roles

    public UserDetailsAdapter(User user, Set<String> roles) { // Modified constructor
        this.user = user;
        this.roles = roles;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream() // Use the pre-processed roles
                .map(roleName -> (GrantedAuthority) () -> "ROLE_" + roleName)
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus().name().equals("ACTIVE");
    }

}

