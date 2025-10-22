package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.SubmissionDTO;
import com.unimar.plataforma_educativa_angular.entities.Submission;
import com.unimar.plataforma_educativa_angular.service.SubmissionService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "http://localhost:4200")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    /**
     * Subir entrega (Estudiante)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitExercise(
            @RequestParam("exerciseId") Long exerciseId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            Submission submission = submissionService.submitExercise(exerciseId, auth.getName(), file);
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener entregas de un ejercicio (Profesor)
     */
    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<?> getSubmissionsByExercise(
            @PathVariable Long exerciseId,
            Authentication auth) {
        try {
            List<Submission> submissions = submissionService.getSubmissionsByExercise(exerciseId, auth.getName());

            // 🔥 Convertir a DTOs
            List<SubmissionDTO> submissionDTOs = submissions.stream()
                    .map(SubmissionDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(submissionDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener mis entregas (Estudiante)
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<?> getMySubmissions(Authentication auth) {
        try {
            List<Submission> submissions = submissionService.getMySubmissions(auth.getName());
            return ResponseEntity.ok(submissions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener una entrega específica
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmissionById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Submission submission = submissionService.getSubmissionById(id, auth.getName());
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Calificar entrega (Profesor)
     */
    @PutMapping("/{id}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Object> gradeData,
            Authentication auth) {
        try {
            Integer grade = (Integer) gradeData.get("grade");
            String feedback = (String) gradeData.get("feedback");

            Submission submission = submissionService.gradeSubmission(id, grade, feedback, auth.getName());
            return ResponseEntity.ok(submission);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Descargar archivo de entrega
     */

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadSubmission(
            @PathVariable Long id,
            Authentication auth) {
        try {

            Path filePath = submissionService.getSubmissionFile(id, auth.getName());
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

    /**
     * Eliminar entrega (Estudiante, antes de calificar)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable Long id,
            Authentication auth) {
        try {
            submissionService.deleteSubmission(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Entrega eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}