package com.example.auth_service.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExpirationMs;

    private Key signKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 bytes. Current: " + keyBytes.length);
        }
        this.signKey = Keys.hmacShaKeyFor(keyBytes);
        System.out.println("JWT key length (bits): " + (signKey.getEncoded().length * 8));
    }

    // ===== Access / Refresh token =====

    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(
                Map.of("roles", userDetails.getAuthorities()),
                userDetails.getUsername(),
                accessTokenExpirationMs
        );
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(
                Map.of("type", "refresh"),
                userDetails.getUsername(),
                refreshTokenExpirationMs
        );
    }

    private String generateToken(Map<String, Object> extraClaims, String subject, long expirationMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(signKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // ===== Extract thông tin từ token =====

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ===== Validate token =====

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // ===== Refresh access token từ refresh token =====

    public String refreshAccessToken(String refreshToken, UserDetails userDetails) {
        if (!isTokenExpired(refreshToken)) {
            String username = extractUsername(refreshToken);
            if (username.equals(userDetails.getUsername())) {
                return generateAccessToken(userDetails);
            }
        }
        throw new RuntimeException("Invalid or expired refresh token");
    }
}
