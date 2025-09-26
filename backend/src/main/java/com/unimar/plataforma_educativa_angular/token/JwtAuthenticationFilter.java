package com.unimar.plataforma_educativa_angular.token;

import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws java.io.IOException, jakarta.servlet.ServletException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String email = jwtUtil.extractEmail(token);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    var userOpt = userService.findByEmail(email);
                    if (userOpt.isPresent() && jwtUtil.validateToken(token, userOpt.get().getEmail())) {
                        User user = userOpt.get();
                        // convierte role a authority: ROLE_STUDENT, ROLE_TEACHER...
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                user.getEmail(), null, List.of(authority));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception e) {
                // opcional: log.warn("Token inválido", e);
            }
        }
        filterChain.doFilter(request, response);
    }
}
