package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.ExerciseDTO;
import com.unimar.plataforma_educativa_angular.entities.Exercise;
import com.unimar.plataforma_educativa_angular.service.ExerciseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "http://localhost:4200")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createExercise(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "externalUrl", required = false) String externalUrl, // ✅ NUEVO
            Authentication auth) {
        try {
            System.out.println("\n========================================");
            System.out.println("📝 CREANDO EJERCICIO");
            System.out.println("========================================");
            System.out.println("   • Título: " + title);
            System.out.println("   • Dificultad: " + difficulty);
            System.out.println("   • Curso ID: " + courseId);
            System.out.println("   • Archivo: " + (file != null ? file.getOriginalFilename() : "No"));
            System.out.println(
                    "   • URL externa: " + (externalUrl != null && !externalUrl.isEmpty() ? externalUrl : "No"));
            System.out.println("========================================\n");

            Exercise exercise = new Exercise();
            exercise.setTitle(title);
            exercise.setDescription(description);
            exercise.setDifficulty(difficulty);

            if (deadline != null && !deadline.isEmpty()) {
                exercise.setDeadline(java.time.LocalDateTime.parse(deadline));
            }

            Exercise created = exerciseService.createExercise(
                    exercise,
                    courseId,
                    auth.getName(),
                    file,
                    externalUrl);

            return ResponseEntity.ok(new ExerciseDTO(created));
        } catch (RuntimeException e) {
            System.err.println("❌ Error al crear ejercicio: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getExercisesByCourse(
            @PathVariable Long courseId,
            Authentication auth) {
        try {
            List<Exercise> exercises = exerciseService.getExercisesByCourse(courseId, auth.getName());

            List<ExerciseDTO> exerciseDTOs = exercises.stream()
                    .map(ExerciseDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(exerciseDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExerciseById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Exercise exercise = exerciseService.getExerciseById(id, auth.getName());
            return ResponseEntity.ok(new ExerciseDTO(exercise));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateExercise(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("difficulty") String difficulty,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "externalUrl", required = false) String externalUrl, // ✅ NUEVO
            Authentication auth) {
        try {
            System.out.println("\n========================================");
            System.out.println("✏️ ACTUALIZANDO EJERCICIO");
            System.out.println("========================================");
            System.out.println("   • ID: " + id);
            System.out.println("   • Título: " + title);
            System.out.println("   • Archivo: " + (file != null ? file.getOriginalFilename() : "No"));
            System.out.println("   • URL externa: " + (externalUrl != null ? externalUrl : "No especificada"));
            System.out.println("========================================\n");

            Exercise exercise = new Exercise();
            exercise.setTitle(title);
            exercise.setDescription(description);
            exercise.setDifficulty(difficulty);

            if (deadline != null && !deadline.isEmpty()) {
                exercise.setDeadline(java.time.LocalDateTime.parse(deadline));
            }

            Exercise updated = exerciseService.updateExercise(
                    id,
                    exercise,
                    auth.getName(),
                    file,
                    externalUrl // ✅ NUEVO parámetro
            );

            return ResponseEntity.ok(new ExerciseDTO(updated));
        } catch (RuntimeException e) {
            System.err.println("❌ Error al actualizar ejercicio: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

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

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadExercise(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Exercise exercise = exerciseService.getExerciseById(id, auth.getName());
            byte[] fileData = exerciseService.getExerciseFile(id, auth.getName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(exercise.getFileType()));
            headers.setContentDispositionFormData("attachment", exercise.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}