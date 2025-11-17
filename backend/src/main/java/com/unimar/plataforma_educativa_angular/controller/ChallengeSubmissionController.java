package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.ChallengeSubmissionDTO;
import com.unimar.plataforma_educativa_angular.entities.ChallengeSubmission;
import com.unimar.plataforma_educativa_angular.service.ChallengeSubmissionService;
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
@RequestMapping("/api/challenge-submissions")
@CrossOrigin(origins = "http://localhost:4200")
public class ChallengeSubmissionController {

    @Autowired
    private ChallengeSubmissionService submissionService;

    /**
     * Subir solución de reto (Estudiante)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitChallenge(
            @RequestParam("challengeId") Long challengeId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            System.out.println("Subiendo solución de reto: " + challengeId);
            System.out.println("   Usuario: " + auth.getName());
            System.out.println("   Archivo: " + file.getOriginalFilename());

            ChallengeSubmission submission = submissionService.submitChallenge(challengeId, auth.getName(), file);

            System.out.println("Solución enviada exitosamente");

            return ResponseEntity.ok(Map.of(
                    "message", "Solución enviada exitosamente. El profesor la revisará pronto.",
                    "submission", new ChallengeSubmissionDTO(submission)));
        } catch (RuntimeException e) {
            System.err.println("Error al enviar solución: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Editar solución (Estudiante)
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateSubmission(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            System.out.println("Editando solución: " + id);
            System.out.println("   Usuario: " + auth.getName());

            ChallengeSubmission submission = submissionService.updateSubmission(id, auth.getName(), file);

            System.out.println("Solución actualizada exitosamente");

            return ResponseEntity.ok(Map.of(
                    "message", "Solución actualizada exitosamente",
                    "submission", new ChallengeSubmissionDTO(submission)));
        } catch (RuntimeException e) {
            System.err.println("Error al editar solución: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener soluciones de un reto (Profesor)
     */
    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<?> getSubmissionsByChallenge(
            @PathVariable Long challengeId,
            Authentication auth) {
        try {
            List<ChallengeSubmission> submissions = submissionService.getSubmissionsByChallenge(challengeId,
                    auth.getName());

            List<ChallengeSubmissionDTO> submissionDTOs = submissions.stream()
                    .map(ChallengeSubmissionDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(submissionDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener mis soluciones (Estudiante)
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<?> getMySubmissions(Authentication auth) {
        try {
            List<ChallengeSubmission> submissions = submissionService.getMySubmissions(auth.getName());

            List<ChallengeSubmissionDTO> submissionDTOs = submissions.stream()
                    .map(ChallengeSubmissionDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(submissionDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener una solución específica
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmissionById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            ChallengeSubmission submission = submissionService.getSubmissionById(id, auth.getName());
            return ResponseEntity.ok(new ChallengeSubmissionDTO(submission));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================
    // REVISAR SOLUCIÓN
    // ========================================
    /**
     * Revisar y otorgar bonificación (Profesor)
     * Este endpoint recibe bonusPoints y feedback del profesor
     */
    @PostMapping("/{id}/review")
    public ResponseEntity<?> reviewSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Object> reviewData,
            Authentication auth) {
        try {
            System.out.println("Revisando solución de reto: " + id);
            System.out.println("   Profesor: " + auth.getName());
            System.out.println("   Datos: " + reviewData);

            Integer bonusPoints = ((Number) reviewData.get("bonusPoints")).intValue();
            String feedback = (String) reviewData.get("feedback");

            ChallengeSubmission submission = submissionService.reviewSubmission(
                    id,
                    bonusPoints,
                    feedback,
                    auth.getName());

            System.out.println("Solución revisada exitosamente");

            return ResponseEntity.ok(Map.of(
                    "message", "Solución revisada exitosamente",
                    "submission", new ChallengeSubmissionDTO(submission)));
        } catch (RuntimeException e) {
            System.err.println("Error al revisar solución: " + e.getMessage());
            e.printStackTrace(); // Para debug
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Descargar archivo de solución
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadSubmission(
            @PathVariable Long id,
            Authentication auth) {
        try {
            ChallengeSubmission submission = submissionService.getSubmissionById(id, auth.getName());
            byte[] fileData = submissionService.getSubmissionFile(id, auth.getName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(submission.getFileType()));
            headers.setContentDispositionFormData("attachment", submission.getFileName());
            headers.setContentLength(fileData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileData);

        } catch (RuntimeException e) {
            System.err.println("Error al descargar solución: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Eliminar solución (Estudiante, antes de revisar)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable Long id,
            Authentication auth) {
        try {
            submissionService.deleteSubmission(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Solución eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}