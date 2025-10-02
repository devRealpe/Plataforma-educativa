package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Método para buscar un usuario por su email (para login)
    Optional<User> findByEmail(String email);

    // Método para verificar si ya existe un usuario con ese email
    boolean existsByEmail(String email);

    // Método para buscar un usuario por su nombre de usuario
    Optional<User> findByNombre(String nombre);
}