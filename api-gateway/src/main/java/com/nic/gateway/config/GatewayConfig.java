package com.nic.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.List;

@Configuration
@Slf4j
public class GatewayConfig {

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("http://localhost:8081"))
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .uri("http://localhost:8082"))
                .route("contact-service", r -> r
                        .path("/api/contacts/**")
                        .uri("http://localhost:8083"))
                .route("campaign-service", r -> r
                        .path("/api/campaigns/**")
                        .uri("http://localhost:8084"))
                .route("messaging-service", r -> r
                        .path("/api/messages/**")
                        .uri("http://localhost:8085"))
                .route("billing-service", r -> r
                        .path("/api/billing/**")
                        .uri("http://localhost:8086"))
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .uri("http://localhost:8087"))
                .route("report-service", r -> r
                        .path("/api/reports/**")
                        .uri("http://localhost:8088"))
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }

    @Bean
    @Order(-1)
    public GlobalFilter loggingFilter() {
        return (exchange, chain) -> {
            log.info("Gateway request: {} {}",
                    exchange.getRequest().getMethod(),
                    exchange.getRequest().getURI());
            return chain.filter(exchange).then(Mono.fromRunnable(() ->
                    log.info("Gateway response status: {}",
                            exchange.getResponse().getStatusCode())
            ));
        };
    }
}