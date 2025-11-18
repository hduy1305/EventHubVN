package com.example.auth_service.adapter;

import com.example.auth_service.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.stream.Collectors;

@Getter
public class UserDetailsAdapter implements UserDetails {
    private final User user;

    public UserDetailsAdapter(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                .map(r -> (GrantedAuthority) () -> "ROLE_" + r.getName())
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

    public User getUser() {
        return user;
    }
}

