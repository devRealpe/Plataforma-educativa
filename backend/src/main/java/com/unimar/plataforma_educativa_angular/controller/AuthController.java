package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.service.UserService;
import com.unimar.plataforma_educativa_angular.token.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User loginRequest) throws Exception {
        User user = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

        System.out.println("Usuario autenticado: " + user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        System.out.println("Token generado correctamente");

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("email", user.getEmail());
        response.put("name", user.getNombre());
        response.put("role", user.getRole().name());

        return response;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User newUser = userService.registerUser(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
        String email = authentication.getName();
        return userService.findByEmail(email)
                .map(user -> {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("email", user.getEmail());
                    resp.put("name", user.getNombre());
                    resp.put("role", user.getRole());
                    // agrega aquí más campos públicos si los tienes (ubicacion, bio, etc.)
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado")));
    }
}
