package com.example.auth_service.config;

import com.example.auth_service.service.CustomUserDetailsService;
import com.example.auth_service.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class); // Logger instance

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    // Bỏ qua filter cho các path auth (login/signup/refresh)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean bypass = path.startsWith("/api/auth");
        if (bypass) {
            log.debug("Bypassing JwtFilter for path: {}", path);
        }
        return bypass;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.debug("Processing request to {} with Authorization header: {}", request.getRequestURI(), authHeader != null ? "Present" : "Missing");
        if (authHeader != null) {
            log.debug("Full Authorization Header: {}", authHeader);
        }

        // Không có header hoặc không phải Bearer → cho qua
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        log.debug("Extracted JWT string (first 50 chars): {}", jwt.length() > 50 ? jwt.substring(0, 50) + "..." : jwt);

        try {
            String username = jwtService.extractUsername(jwt);
            log.debug("Extracted username: {} from JWT.", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                log.debug("Loaded UserDetails for username: {}", username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.debug("JWT token is valid for user: {}", username);
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("SecurityContextHolder populated with Authentication for user: {}. Authorities: {}", username, authToken.getAuthorities());
                } else {
                    log.warn("JWT token is NOT valid for user: {}", username);
                }
            } else if (SecurityContextHolder.getContext().getAuthentication() != null) {
                log.debug("SecurityContextHolder already contains Authentication for user: {}", SecurityContextHolder.getContext().getAuthentication().getName());
            } else {
                log.warn("Username is null from JWT or SecurityContextHolder already has Authentication set. Username: {}", username);
            }
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("JWT processing failed: {}", ex.getMessage());
            // Token sai/het hạn → bỏ qua, KHÔNG ném lỗi ra ngoài
            // Có thể log lại nếu muốn:
            // System.out.println("Invalid JWT: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
