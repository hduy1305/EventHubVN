package com.example.gateway_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    // Inject the GatewayFilterFactory, not the filter itself
    private final JwtAuthGatewayFilterFactory jwtAuthGatewayFilterFactory;

    // Use routes defined in application.yml instead of hardcoding them here.
    // This avoids conflict and ensures consistency.
    /*
    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                .route("auth-service", r -> r.path("/auth/**")
                        .uri("http://auth-service:8081"))

                .route("event-service", r -> r.path("/events/**")
                        .uri("http://event-service:8082"))

                .route("order-service", r -> r.path("/orders/**")
                        .uri("http://order-service:8083"))

                .route("payment-service", r -> r.path("/payments/**")
                        .uri("http://payment-service:8084"))

                .route("secure-route",
                        r -> r.path("/secure/**")
                                // Apply the filter using the factory
                                .filters(f -> f.filter(jwtAuthGatewayFilterFactory.apply(new JwtAuthGatewayFilterFactory.Config())).stripPrefix(1))
                                .uri("http://order-service:8083"))

                .build();
    }
    */
}

