package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public ExerciseService(
            ExerciseRepository exerciseRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Exercise createExercise(Exercise exercise, Long courseId, String teacherEmail, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para agregar ejercicios a este curso");
        }

        // Guardar archivo como bytes en la base de datos
        if (file != null && !file.isEmpty()) {
            try {
                exercise.setFileData(file.getBytes());
                exercise.setFileName(file.getOriginalFilename());
                exercise.setFileType(file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
            }
        }

        exercise.setCourse(course);
        return exerciseRepository.save(exercise);
    }

    public List<Exercise> getExercisesByCourse(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isTeacher = course.getTeacher().getId().equals(user.getId());
        boolean isStudent = course.getStudents().contains(user);

        if (!isTeacher && !isStudent) {
            throw new RuntimeException("No tienes acceso a este curso");
        }

        return exerciseRepository.findByCourseId(courseId);
    }

    public Exercise getExerciseById(Long id, String userEmail) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Course course = exercise.getCourse();
        boolean hasAccess = course.getTeacher().getId().equals(user.getId()) ||
                course.getStudents().contains(user);

        if (!hasAccess) {
            throw new RuntimeException("No tienes acceso a este ejercicio");
        }

        return exercise;
    }

    @Transactional
    public Exercise updateExercise(Long id, Exercise exerciseData, String teacherEmail, MultipartFile file) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!exercise.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para editar este ejercicio");
        }

        exercise.setTitle(exerciseData.getTitle());
        exercise.setDescription(exerciseData.getDescription());
        exercise.setDifficulty(exerciseData.getDifficulty());
        exercise.setDeadline(exerciseData.getDeadline());

        // Actualizar archivo si se proporciona
        if (file != null && !file.isEmpty()) {
            try {
                exercise.setFileData(file.getBytes());
                exercise.setFileName(file.getOriginalFilename());
                exercise.setFileType(file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo: " + e.getMessage());
            }
        }

        return exerciseRepository.save(exercise);
    }

    @Transactional
    public void deleteExercise(Long id, String teacherEmail) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!exercise.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este ejercicio");
        }

        exerciseRepository.delete(exercise);
    }

    // Obtener archivo del ejercicio
    public byte[] getExerciseFile(Long id, String userEmail) {
        Exercise exercise = getExerciseById(id, userEmail);

        // ✅ CORRECCIÓN: Usar el método hasFile() en lugar de acceder directamente
        if (!exercise.hasFile()) {
            throw new RuntimeException("Este ejercicio no tiene archivo adjunto");
        }

        return exercise.getFileData();
    }
}