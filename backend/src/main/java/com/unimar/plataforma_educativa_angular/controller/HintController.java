package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.entities.Hint;
import com.unimar.plataforma_educativa_angular.service.HintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hints")
@CrossOrigin(origins = "http://localhost:4200")
public class HintController {

    @Autowired
    private HintService hintService;

    /**
     * Crear pista (Profesor)
     */
    @PostMapping
    public ResponseEntity<?> createHint(
            @RequestBody Hint hint,
            @RequestParam Long exerciseId,
            Authentication auth) {
        try {
            Hint createdHint = hintService.createHint(hint, exerciseId, auth.getName());
            return ResponseEntity.ok(createdHint);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener pistas de un ejercicio
     */
    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<?> getHintsByExercise(
            @PathVariable Long exerciseId,
            Authentication auth) {
        try {
            List<Hint> hints = hintService.getHintsByExercise(exerciseId, auth.getName());
            return ResponseEntity.ok(hints);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Actualizar pista
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHint(
            @PathVariable Long id,
            @RequestBody Hint hint,
            Authentication auth) {
        try {
            Hint updatedHint = hintService.updateHint(id, hint, auth.getName());
            return ResponseEntity.ok(updatedHint);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Eliminar pista
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHint(
            @PathVariable Long id,
            Authentication auth) {
        try {
            hintService.deleteHint(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Pista eliminada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}