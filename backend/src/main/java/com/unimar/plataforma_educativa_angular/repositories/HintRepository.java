package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Exercise;
import com.unimar.plataforma_educativa_angular.entities.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HintRepository extends JpaRepository<Hint, Long> {

    // Buscar pistas por ejercicio
    List<Hint> findByExercise(Exercise exercise);

    // Buscar pistas por ejercicio ID ordenadas por orden
    List<Hint> findByExerciseIdOrderByOrderAsc(Long exerciseId);

    // Contar pistas por ejercicio
    long countByExerciseId(Long exerciseId);

}