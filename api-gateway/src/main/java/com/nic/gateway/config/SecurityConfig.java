package com.nic.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(exchanges -> exchanges
                        // Public endpoints — no token needed
                        .pathMatchers("/api/auth/register").permitAll()
                        .pathMatchers("/api/auth/login").permitAll()
                        .pathMatchers("/api/auth/send-otp").permitAll()
                        .pathMatchers("/api/auth/verify-otp").permitAll()
                        .pathMatchers("/actuator/**").permitAll()
                        // Everything else passes through — each service handles its own JWT
                        .anyExchange().permitAll()
                );
        return http.build();
    }
}