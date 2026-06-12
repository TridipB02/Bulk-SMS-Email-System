package com.nic.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${AUTH_SERVICE_URL:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${USER_SERVICE_URL:http://localhost:8082}")
    private String userServiceUrl;

    @Value("${CONTACT_SERVICE_URL:http://localhost:8083}")
    private String contactServiceUrl;

    @Value("${CAMPAIGN_SERVICE_URL:http://localhost:8084}")
    private String campaignServiceUrl;

    @Value("${MESSAGING_SERVICE_URL:http://localhost:8085}")
    private String messagingServiceUrl;

    @Value("${BILLING_SERVICE_URL:http://localhost:8086}")
    private String billingServiceUrl;

    @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8087}")
    private String notificationServiceUrl;

    @Value("${REPORT_SERVICE_URL:http://localhost:8088}")
    private String reportServiceUrl;

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri(authServiceUrl))
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .uri(userServiceUrl))
                .route("contact-service", r -> r
                        .path("/api/contacts/**")
                        .uri(contactServiceUrl))
                .route("campaign-service", r -> r
                        .path("/api/campaigns/**")
                        .uri(campaignServiceUrl))
                .route("messaging-service", r -> r
                        .path("/api/messages/**")
                        .uri(messagingServiceUrl))
                .route("billing-service", r -> r
                        .path("/api/billing/**")
                        .uri(billingServiceUrl))
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .uri(notificationServiceUrl))
                .route("report-service", r -> r
                        .path("/api/reports/**")
                        .uri(reportServiceUrl))
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