package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    // Buscar ejercicios por curso
    List<Exercise> findByCourse(Course course);

    // Buscar ejercicios por curso ID
    List<Exercise> findByCourseId(Long courseId);

    // Buscar por dificultad
    List<Exercise> findByDifficulty(String difficulty);

    // Contar ejercicios por curso
    long countByCourseId(Long courseId);
}