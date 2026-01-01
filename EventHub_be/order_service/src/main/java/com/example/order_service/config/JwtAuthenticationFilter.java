package com.example.order_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = authHeader.substring(7);
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            String email = claims.getSubject();
            String idString = claims.get("id", String.class); // Extract UUID as String
            UUID userId = UUID.fromString(idString); // Convert to UUID
            
            // Correctly parse roles from claims
            List<Map<String, String>> rolesFromClaims = claims.get("roles", List.class);
            
            if (email != null && userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var authorities = rolesFromClaims == null ? List.of() :
                        rolesFromClaims.stream()
                                .filter(roleMap -> roleMap != null && roleMap.containsKey("authority") && roleMap.get("authority") != null) // Add null checks
                                .map(roleMap -> new SimpleGrantedAuthority(roleMap.get("authority"))) // Extract "authority" field
                                .collect(Collectors.toList());

                // Use UserPrincipal as the principal object and store the raw JWT
                UserPrincipal userPrincipal = new UserPrincipal(userId, email, jwt); // Store the raw JWT token
                
                var authToken = new UsernamePasswordAuthenticationToken(userPrincipal, null, (Collection<? extends GrantedAuthority>) authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception ex) {
            // Token sai hoặc hết hạn => bỏ qua, không ném lỗi
            System.err.println("JWT Validation Error in Order Service: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
