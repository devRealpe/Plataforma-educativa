package com.unimar.plataforma_educativa_angular.config;

import com.unimar.plataforma_educativa_angular.token.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/**")
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ========================================
                        // Endpoints públicos (sin autenticación)
                        // ========================================
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()

                        // ========================================
                        // Endpoints de cursos (autenticados)
                        // ========================================
                        .requestMatchers("/api/courses/**").authenticated()

                        // ========================================
                        // Endpoints de ejercicios (autenticados)
                        // ========================================
                        .requestMatchers("/api/exercises/**").authenticated()

                        // ========================================
                        // Endpoints de pistas (autenticados)
                        // ========================================
                        .requestMatchers("/api/hints/**").authenticated()

                        // ========================================
                        // 🔥 CRÍTICO: Endpoints de entregas
                        // Nota: El controlador usa la ruta base "/api/submissions"
                        // pero los endpoints están bajo "/api/exercises/submissions"
                        // en el código del controlador. Sin embargo, Spring Security
                        // necesita la ruta correcta del @RequestMapping.
                        // ========================================
                        .requestMatchers("/api/submissions/**").authenticated()

                        .requestMatchers("/api/challenges/**").authenticated()
                        .requestMatchers("/api/challenge-submissions/**").authenticated()
                        .requestMatchers("/api/podium/**").authenticated()

                        .requestMatchers("/api/stats/**").authenticated()

                        // ========================================
                        // Cualquier otra petición requiere autenticación
                        // ========================================
                        .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Orígenes permitidos
        config.setAllowedOrigins(List.of("http://localhost:4200"));

        // ✅ Métodos HTTP permitidos (incluye PATCH para publicar entregas)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // ✅ Headers permitidos
        config.setAllowedHeaders(List.of("*"));

        // ✅ Headers expuestos al cliente
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));

        // ✅ Permitir credenciales (cookies, authorization headers)
        config.setAllowCredentials(true);

        // ✅ Tiempo de caché de la respuesta preflight (1 hora)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}