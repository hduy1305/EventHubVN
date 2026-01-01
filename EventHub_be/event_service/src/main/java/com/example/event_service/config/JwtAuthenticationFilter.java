package com.example.event_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class); // Logger instance

    @Value("${jwt.secret}")
    private String secret;

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        log.debug("Processing request to {} with path: {}", request.getRequestURI(), path); // Log path

        String authHeader = request.getHeader("Authorization");
        log.debug("Processing request to {} with Authorization header: {}", request.getRequestURI(), authHeader != null ? "Present" : "Missing");
        if (authHeader != null) {
            log.debug("Full Authorization Header: {}", authHeader);
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No Bearer token found or malformed header. Allowing request to proceed anonymously.");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7);
            log.debug("Extracted JWT string (first 50 chars): {}", jwt.length() > 50 ? jwt.substring(0, 50) + "..." : jwt);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            String email = claims.getSubject();
            String idString = claims.get("id", String.class); // Extract UUID as String
            UUID userId = UUID.fromString(idString); // Convert to UUID
            
            // Correctly parse roles from claims
            List<Map<String, String>> rolesFromClaims = claims.get("roles", List.class); // Get as List of Maps
            log.debug("Roles from JWT claims for user {}: {}", email, rolesFromClaims);
            
            if (email != null && userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                List<SimpleGrantedAuthority> authorities = rolesFromClaims == null ? List.of() :
                        rolesFromClaims.stream()
                                .filter(roleMap -> {
                                    if (roleMap == null) {
                                        log.warn("JWT roleMap is null. Filtering out.");
                                        return false;
                                    }
                                    if (!roleMap.containsKey("authority")) {
                                        log.warn("JWT roleMap {} does not contain 'authority' key. Filtering out.", roleMap);
                                        return false;
                                    }
                                    if (roleMap.get("authority") == null) {
                                        log.warn("JWT roleMap {} has null 'authority' value. Filtering out.", roleMap);
                                        return false;
                                    }
                                    log.debug("Processing roleMap: {} with authority: {}", roleMap, roleMap.get("authority"));
                                    return true;
                                })
                                .map(roleMap -> new SimpleGrantedAuthority(roleMap.get("authority"))) // Extract "authority" field
                                .collect(Collectors.toList());
                log.debug("Authorities collected for user {}: {}", email, authorities);

                // Use UserPrincipal as the principal object and store the raw JWT
                // Now UserPrincipal implements UserDetails, so we can pass authorities directly
                UserPrincipal userPrincipal = UserPrincipal.builder()
                        .id(userId)
                        .email(email)
                        .jwtToken(jwt)
                        .authorities(authorities) // Pass the authorities here
                        .build();
                
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities()); // Use getAuthorities() from UserPrincipal
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.debug("SecurityContextHolder populated for user: {} with ID: {}. Authorities: {}", email, userId, userPrincipal.getAuthorities());
            } else {
                log.debug("Email or userId is null, or SecurityContextHolder already populated. Email: {}, userId: {}", email, userId);
            }

        } catch (Exception ex) {
            log.warn("JWT processing failed: {}", ex.getMessage(), ex);
        }

        filterChain.doFilter(request, response);
    }
}

