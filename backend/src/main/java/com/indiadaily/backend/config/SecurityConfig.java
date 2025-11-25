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
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // Static image URLs — always public
                        .requestMatchers("/uploads/**").permitAll()

                        // Admin login (public)
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/create").permitAll()

                        // Public APIs like:
                        // latest news, category, slug, trending, featured etc.
                        .requestMatchers("/api/public/**").permitAll()

                        // News CRUD — protect with JWT
                        .requestMatchers("/api/news/add").authenticated()
                        .requestMatchers("/api/news/**").authenticated()

                        // Admin dashboards — fully protected
                        .requestMatchers("/api/admin/**").authenticated()

                        // Everything else — allow
                        .anyRequest().permitAll()
                );

        // Add JWT filter
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
