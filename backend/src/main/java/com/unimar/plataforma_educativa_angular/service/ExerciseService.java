package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ExerciseService(
            ExerciseRepository exerciseRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            FileStorageService fileStorageService) {
        this.exerciseRepository = exerciseRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Crear ejercicio (Profesor)
     */
    @Transactional
    public Exercise createExercise(Exercise exercise, Long courseId, String teacherEmail, MultipartFile file) {
        // Verificar que el curso existe
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Verificar que el usuario es el profesor del curso
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para agregar ejercicios a este curso");
        }

        // Guardar archivo si existe
        if (file != null && !file.isEmpty()) {
            try {
                String filePath = fileStorageService.storeFile(file, "exercises");
                exercise.setFilePath(filePath);
                exercise.setFileName(file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Error al guardar el archivo: " + e.getMessage());
            }
        }

        exercise.setCourse(course);
        return exerciseRepository.save(exercise);
    }

    /**
     * Obtener ejercicios de un curso
     */
    public List<Exercise> getExercisesByCourse(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario es profesor del curso o estudiante inscrito
        boolean isTeacher = course.getTeacher().getId().equals(user.getId());
        boolean isStudent = course.getStudents().contains(user);

        if (!isTeacher && !isStudent) {
            throw new RuntimeException("No tienes acceso a este curso");
        }

        return exerciseRepository.findByCourseId(courseId);
    }

    /**
     * Obtener un ejercicio por ID
     */
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

    /**
     * Actualizar ejercicio
     */
    @Transactional
    public Exercise updateExercise(Long id, Exercise exerciseData, String teacherEmail, MultipartFile file) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!exercise.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para editar este ejercicio");
        }

        // Actualizar datos
        exercise.setTitle(exerciseData.getTitle());
        exercise.setDescription(exerciseData.getDescription());
        exercise.setDifficulty(exerciseData.getDifficulty());
        exercise.setPoints(exerciseData.getPoints());
        exercise.setDeadline(exerciseData.getDeadline());

        // Actualizar archivo si se proporciona uno nuevo
        if (file != null && !file.isEmpty()) {
            try {
                // Eliminar archivo anterior si existe
                if (exercise.getFilePath() != null) {
                    fileStorageService.deleteFile(exercise.getFilePath());
                }

                String filePath = fileStorageService.storeFile(file, "exercises");
                exercise.setFilePath(filePath);
                exercise.setFileName(file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo: " + e.getMessage());
            }
        }

        return exerciseRepository.save(exercise);
    }

    /**
     * Eliminar ejercicio
     */
    @Transactional
    public void deleteExercise(Long id, String teacherEmail) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!exercise.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este ejercicio");
        }

        // Eliminar archivo asociado
        if (exercise.getFilePath() != null) {
            try {
                fileStorageService.deleteFile(exercise.getFilePath());
            } catch (IOException e) {
                // Log error pero continuar con la eliminación
                System.err.println("Error al eliminar archivo: " + e.getMessage());
            }
        }

        exerciseRepository.delete(exercise);
    }

    /**
     * Obtener archivo del ejercicio para descarga
     */
    public Path getExerciseFile(Long id, String userEmail) {
        Exercise exercise = getExerciseById(id, userEmail);

        if (exercise.getFilePath() == null) {
            throw new RuntimeException("Este ejercicio no tiene archivo adjunto");
        }

        Path filePath = fileStorageService.getFilePath(exercise.getFilePath());

        if (!fileStorageService.fileExists(exercise.getFilePath())) {
            throw new RuntimeException("Archivo no encontrado");
        }

        return filePath;
    }
}