package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HintService {

    private final HintRepository hintRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public HintService(
            HintRepository hintRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository) {
        this.hintRepository = hintRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Crear pista (Solo profesor del curso)
     */
    @Transactional
    public Hint createHint(Hint hint, Long exerciseId, String teacherEmail) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Verificar que el usuario es el profesor del curso
        if (!exercise.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para agregar pistas a este ejercicio");
        }

        hint.setExercise(exercise);
        return hintRepository.save(hint);
    }

    /**
     * Obtener pistas de un ejercicio
     */
    public List<Hint> getHintsByExercise(Long exerciseId, String userEmail) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario tiene acceso al curso
        Course course = exercise.getCourse();
        boolean hasAccess = course.getTeacher().getId().equals(user.getId()) ||
                course.getStudents().contains(user);

        if (!hasAccess) {
            throw new RuntimeException("No tienes acceso a este ejercicio");
        }

        return hintRepository.findByExerciseIdOrderByOrderAsc(exerciseId);
    }

    /**
     * Actualizar pista
     */
    @Transactional
    public Hint updateHint(Long id, Hint hintData, String teacherEmail) {
        Hint hint = hintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pista no encontrada"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Verificar permisos
        if (!hint.getExercise().getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para editar esta pista");
        }

        hint.setContent(hintData.getContent());
        hint.setOrder(hintData.getOrder());
        hint.setCost(hintData.getCost());

        return hintRepository.save(hint);
    }

    /**
     * Eliminar pista
     */
    @Transactional
    public void deleteHint(Long id, String teacherEmail) {
        Hint hint = hintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pista no encontrada"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Verificar permisos
        if (!hint.getExercise().getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar esta pista");
        }

        hintRepository.delete(hint);
    }
}