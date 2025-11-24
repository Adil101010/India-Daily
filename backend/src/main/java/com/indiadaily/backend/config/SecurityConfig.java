package com.indiadaily.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Static uploaded images (for frontend) – always public
                        .requestMatchers("/uploads/**").permitAll()

                        // Admin auth (login/create) – public
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/create").permitAll()

                        // Public read-only APIs (future: latest, category, slug etc.)
                        .requestMatchers("/api/public/**").permitAll()

                        // Admin / News management – JWT required
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/api/news/**").authenticated()

                        // Anything else – allowed (e.g. index.html, static resources)
                        .anyRequest().permitAll()
                );

        // JWT Filter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
