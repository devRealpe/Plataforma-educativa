package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.PodiumDTO;
import com.unimar.plataforma_educativa_angular.service.PodiumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/podium")
@CrossOrigin(origins = "http://localhost:4200")
public class PodiumController {

    @Autowired
    private PodiumService podiumService;

    /**
     * Obtener podio de un curso específico
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getPodiumByCourse(
            @PathVariable Long courseId,
            Authentication auth) {
        try {
            List<PodiumDTO> podium = podiumService.getPodiumByCourse(courseId, auth.getName());
            return ResponseEntity.ok(podium);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener podio por nivel de curso
     */
    @GetMapping("/level/{level}")
    public ResponseEntity<?> getPodiumByLevel(
            @PathVariable String level,
            Authentication auth) {
        try {
            List<PodiumDTO> podium = podiumService.getPodiumByLevel(level, auth.getName());
            return ResponseEntity.ok(podium);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener mi posición en el podio
     */
    @GetMapping("/my-position/{courseId}")
    public ResponseEntity<?> getMyPosition(
            @PathVariable Long courseId,
            Authentication auth) {
        try {
            PodiumDTO position = podiumService.getStudentPosition(courseId, auth.getName());
            return ResponseEntity.ok(position);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}