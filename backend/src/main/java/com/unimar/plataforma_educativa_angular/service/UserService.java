package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User registerUser(User user) throws Exception {
        String emailNormalized = user.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(emailNormalized)) {
            throw new Exception("El email ya está registrado");
        }
        user.setEmail(emailNormalized);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) throws Exception {
        String emailNormalized = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(emailNormalized);
        if (userOpt.isEmpty()) {
            logger.info("No se encontró usuario con email: {}", emailNormalized);
            throw new Exception("Email no registrado");
        }

        User user = userOpt.get();
        logger.info("Usuario encontrado. Comparando password para: {}", emailNormalized);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            logger.info("Password recibido: {}", password);
            logger.info("Password en BD: {}", user.getPassword());
            throw new Exception("Contraseña incorrecta");
        }

        return user;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ========================================
    // ✅ NUEVO: Actualizar nombre del usuario
    // ========================================
    public User updateUserName(String email, String newName) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        user.setNombre(newName);
        return userRepository.save(user);
    }

    // ========================================
    // ✅ NUEVO: Cambiar contraseña
    // ========================================
    public void changePassword(String email, String currentPassword, String newPassword) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new Exception("La contraseña actual es incorrecta");
        }

        // Validar que la nueva contraseña sea diferente
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new Exception("La nueva contraseña debe ser diferente a la actual");
        }

        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        logger.info("Contraseña actualizada exitosamente para: {}", email);
    }
}