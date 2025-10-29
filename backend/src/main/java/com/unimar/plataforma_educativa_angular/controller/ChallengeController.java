package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.ChallengeDTO;
import com.unimar.plataforma_educativa_angular.entities.Challenge;
import com.unimar.plataforma_educativa_angular.service.ChallengeService;
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
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:4200")
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    /**
     * Publicar reto (Profesor)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createChallenge(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("maxBonusPoints") Integer maxBonusPoints,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication auth) {
        try {
            Challenge challenge = new Challenge();
            challenge.setTitle(title);
            challenge.setDescription(description);
            challenge.setDifficulty(difficulty);
            challenge.setMaxBonusPoints(maxBonusPoints);

            if (deadline != null && !deadline.isEmpty()) {
                challenge.setDeadline(java.time.LocalDateTime.parse(deadline));
            }

            Challenge created = challengeService.createChallenge(challenge, courseId, auth.getName(), file);

            return ResponseEntity.ok(new ChallengeDTO(created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener retos de un curso
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getChallengesByCourse(
            @PathVariable Long courseId,
            Authentication auth) {
        try {
            List<Challenge> challenges = challengeService.getActiveChallengesByCourse(courseId, auth.getName());

            List<ChallengeDTO> challengeDTOs = challenges.stream()
                    .map(ChallengeDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(challengeDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener reto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getChallengeById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Challenge challenge = challengeService.getChallengeById(id, auth.getName());
            return ResponseEntity.ok(new ChallengeDTO(challenge));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Editar reto (Profesor)
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateChallenge(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("maxBonusPoints") Integer maxBonusPoints,
            @RequestParam(value = "deadline", required = false) String deadline,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication auth) {
        try {
            Challenge challenge = new Challenge();
            challenge.setTitle(title);
            challenge.setDescription(description);
            challenge.setDifficulty(difficulty);
            challenge.setMaxBonusPoints(maxBonusPoints);
            challenge.setActive(active);

            if (deadline != null && !deadline.isEmpty()) {
                challenge.setDeadline(java.time.LocalDateTime.parse(deadline));
            }

            Challenge updated = challengeService.updateChallenge(id, challenge, auth.getName(), file);

            return ResponseEntity.ok(new ChallengeDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Eliminar reto (Profesor)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChallenge(
            @PathVariable Long id,
            Authentication auth) {
        try {
            challengeService.deleteChallenge(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Reto eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Descargar archivo del reto
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadChallenge(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Challenge challenge = challengeService.getChallengeById(id, auth.getName());
            byte[] fileData = challengeService.getChallengeFile(id, auth.getName());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(challenge.getFileType()));
            headers.setContentDispositionFormData("attachment", challenge.getFileName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileData);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}