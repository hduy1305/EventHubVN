package com.example.payment_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class); // Logger instance

    @Value("${jwt.secret}")
    private String secret;

    private Key getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = req.getRequestURI();

        log.debug("Processing request to {} with path: {}", req.getRequestURI(), path);

        // Cho phép webhook không cần JWT
        if (path.startsWith("/api/webhook")) {
            log.debug("Bypassing JwtAuthenticationFilter for webhook path: {}", path);
            chain.doFilter(req, res);
            return;
        }

        String auth = req.getHeader("Authorization");
        log.debug("Processing request to {} with Authorization header: {}", req.getRequestURI(), auth != null ? "Present" : "Missing");
        if (auth != null) {
            log.debug("Full Authorization Header: {}", auth);
        }

        if (auth == null || !auth.startsWith("Bearer ")) {
            log.debug("No Bearer token found or malformed header. Allowing request to proceed anonymously.");
            chain.doFilter(req, res);
            return;
        }

        try {
            String jwt = auth.substring(7);
            log.debug("Extracted JWT string (first 50 chars): {}", jwt.length() > 50 ? jwt.substring(0, 50) + "..." : jwt);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            String email = claims.getSubject();
            String idString = claims.get("id", String.class); // Extract UUID as String
            UUID userId = UUID.fromString(idString);
            
            // Correctly parse roles from claims
            List<Map<String, String>> rolesFromClaims = claims.get("roles", List.class);
            
            if (email != null && userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var authorities = rolesFromClaims == null ? List.of() :
                        rolesFromClaims.stream()
                                .filter(roleMap -> roleMap != null && roleMap.containsKey("authority") && roleMap.get("authority") != null)
                                .map(roleMap -> new SimpleGrantedAuthority(roleMap.get("authority")))
                                .collect(Collectors.toList());

                // Use UserPrincipal as the principal object and store the raw JWT
                UserPrincipal userPrincipal = new UserPrincipal(userId, email, jwt);
                
                var authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal,
                        null,
                        (Collection<? extends GrantedAuthority>) authorities
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("SecurityContextHolder populated for user: {} with ID: {}", email, userId);
            } else {
                log.debug("Email or userId is null, or SecurityContextHolder already populated. Email: {}, userId: {}", email, userId);
            }

        } catch (Exception ex) {
            log.warn("JWT processing failed: {}", ex.getMessage(), ex);
        }

        chain.doFilter(req, res);
    }
}

