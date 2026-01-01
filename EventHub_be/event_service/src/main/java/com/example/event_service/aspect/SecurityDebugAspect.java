package com.example.event_service.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class SecurityDebugAspect {

    private static final Logger log = LoggerFactory.getLogger(SecurityDebugAspect.class);

    @Before("execution(* com.example.event_service.controller.EventController.create(..))")
    public void beforeEventCreate(JoinPoint joinPoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            log.info("--- Security Context Debug (before @PreAuthorize) ---");
            log.info("Authentication Principal: {}", authentication.getPrincipal());
            log.info("Authentication Name: {}", authentication.getName());
            log.info("Authentication Authorities: {}", authentication.getAuthorities());
            log.info("Authentication isAuthenticated: {}", authentication.isAuthenticated());
            log.info("-----------------------------------------------------");
        } else {
            log.warn("--- Security Context Debug (before @PreAuthorize) ---");
            log.warn("Authentication is NULL in SecurityContextHolder.");
            log.warn("-----------------------------------------------------");
        }
    }
}
