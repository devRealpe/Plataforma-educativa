package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
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

    private void validateUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return; // URL opcional
        }

        String urlTrimmed = url.trim();

        // Validar que sea una URL válida
        try {
            new URL(urlTrimmed);
        } catch (MalformedURLException e) {
            throw new RuntimeException("La URL proporcionada no es válida: " + urlTrimmed);
        }

        // Validar longitud
        if (urlTrimmed.length() > 500) {
            throw new RuntimeException("La URL es demasiado larga (máximo 500 caracteres)");
        }

        // Validar que comience con http:// o https://
        if (!urlTrimmed.startsWith("http://") && !urlTrimmed.startsWith("https://")) {
            throw new RuntimeException("La URL debe comenzar con http:// o https://");
        }
    }

    @Transactional
    public Exercise createExercise(Exercise exercise, Long courseId, String teacherEmail,
            MultipartFile file, String externalUrl) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para agregar ejercicios a este curso");
        }

        if (externalUrl != null && !externalUrl.trim().isEmpty()) {
            validateUrl(externalUrl);
            exercise.setExternalUrl(externalUrl.trim());
            System.out.println("✅ URL externa guardada: " + externalUrl.trim());
        }

        // Guardar archivo como bytes en la base de datos
        if (file != null && !file.isEmpty()) {
            try {
                exercise.setFileData(file.getBytes());
                exercise.setFileName(file.getOriginalFilename());
                exercise.setFileType(file.getContentType());
                System.out.println("✅ Archivo guardado: " + file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
            }
        }

        if (!exercise.hasFile() && !exercise.hasExternalUrl()) {
            System.out.println("⚠️ Advertencia: Ejercicio sin recursos (archivo o URL)");
            // Nota: Esto es válido, algunos ejercicios pueden ser solo descripción
        }

        exercise.setCourse(course);
        Exercise saved = exerciseRepository.save(exercise);

        System.out.println("📝 Ejercicio creado exitosamente:");
        System.out.println("   • ID: " + saved.getId());
        System.out.println("   • Título: " + saved.getTitle());
        System.out.println("   • Tiene archivo: " + saved.hasFile());
        System.out.println("   • Tiene URL: " + saved.hasExternalUrl());
        System.out.println("   • Tipo de recurso: " + saved.getResourceType());

        return saved;
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
    public Exercise updateExercise(Long id, Exercise exerciseData, String teacherEmail,
            MultipartFile file, String externalUrl) {
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
        if (externalUrl != null) {
            if (externalUrl.trim().isEmpty()) {
                // Si se envía vacío, eliminar la URL
                exercise.setExternalUrl(null);
                System.out.println("🗑️ URL externa eliminada");
            } else {
                // Si se envía una URL, validarla y guardarla
                validateUrl(externalUrl);
                exercise.setExternalUrl(externalUrl.trim());
                System.out.println("✅ URL externa actualizada: " + externalUrl.trim());
            }
        }

        // Actualizar archivo si se proporciona
        if (file != null && !file.isEmpty()) {
            try {
                exercise.setFileData(file.getBytes());
                exercise.setFileName(file.getOriginalFilename());
                exercise.setFileType(file.getContentType());
                System.out.println("✅ Archivo actualizado: " + file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo: " + e.getMessage());
            }
        }

        Exercise updated = exerciseRepository.save(exercise);

        System.out.println("📝 Ejercicio actualizado exitosamente:");
        System.out.println("   • ID: " + updated.getId());
        System.out.println("   • Título: " + updated.getTitle());
        System.out.println("   • Tiene archivo: " + updated.hasFile());
        System.out.println("   • Tiene URL: " + updated.hasExternalUrl());
        System.out.println("   • Tipo de recurso: " + updated.getResourceType());

        return updated;
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

    public byte[] getExerciseFile(Long id, String userEmail) {
        Exercise exercise = getExerciseById(id, userEmail);

        if (!exercise.hasFile()) {
            throw new RuntimeException("Este ejercicio no tiene archivo adjunto");
        }

        return exercise.getFileData();
    }
}