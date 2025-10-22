package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Exercise;
import com.unimar.plataforma_educativa_angular.entities.Submission;
import com.unimar.plataforma_educativa_angular.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // Buscar entregas por ejercicio
    List<Submission> findByExercise(Exercise exercise);

    // Buscar entregas por ejercicio ID
    List<Submission> findByExerciseId(Long exerciseId);

    // Buscar entregas por estudiante
    List<Submission> findByStudent(User student);

    // Buscar entregas por estudiante ID
    List<Submission> findByStudentId(Long studentId);

    // Buscar entrega específica de un estudiante en un ejercicio
    Optional<Submission> findByExerciseAndStudent(Exercise exercise, User student);

    // Buscar entregas por ejercicio ID y estudiante ID
    Optional<Submission> findByExerciseIdAndStudentId(Long exerciseId, Long studentId);

    // Buscar entregas por estado
    List<Submission> findByStatus(Submission.SubmissionStatus status);

    // Contar entregas por ejercicio
    long countByExerciseId(Long exerciseId);

    // Contar entregas calificadas por estudiante
    long countByStudentIdAndStatus(Long studentId, Submission.SubmissionStatus status);

    // Verificar si un estudiante ya entregó un ejercicio
    boolean existsByExerciseIdAndStudentId(Long exerciseId, Long studentId);
}