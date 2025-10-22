package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.entities.Exercise;
import com.unimar.plataforma_educativa_angular.service.ExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:4200")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    /**
     * Crear ejercicio (Profesor)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createExercise(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("points") Integer points,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication auth) {
        try {
            Exercise exercise = new Exercise();
            exercise.setTitle(title);
            exercise.setDescription(description);
            exercise.setDifficulty(difficulty);
            exercise.setPoints(points);

            if (deadline != null && !deadline.isEmpty()) {
                exercise.setDeadline(java.time.LocalDateTime.parse(deadline));
            }

            Exercise created = exerciseService.createExercise(exercise, courseId, auth.getName(), file);

            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener ejercicios de un curso
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getExercisesByCourse(
            @PathVariable Long courseId,
            Authentication auth) {
        try {
            List<Exercise> exercises = exerciseService.getExercisesByCourse(courseId, auth.getName());
            return ResponseEntity.ok(exercises);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener un ejercicio por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getExerciseById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Exercise exercise = exerciseService.getExerciseById(id, auth.getName());
            return ResponseEntity.ok(exercise);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Actualizar ejercicio
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateExercise(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("points") Integer points,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication auth) {
        try {
            Exercise exercise = new Exercise();
            exercise.setTitle(title);
            exercise.setDescription(description);
            exercise.setDifficulty(difficulty);
            exercise.setPoints(points);

            if (deadline != null && !deadline.isEmpty()) {
                exercise.setDeadline(java.time.LocalDateTime.parse(deadline));
            }

            Exercise updated = exerciseService.updateExercise(id, exercise, auth.getName(), file);

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Eliminar ejercicio
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExercise(
            @PathVariable Long id,
            Authentication auth) {
        try {
            exerciseService.deleteExercise(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Ejercicio eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Descargar archivo del ejercicio
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadExercise(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Path filePath = exerciseService.getExerciseFile(id, auth.getName());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}