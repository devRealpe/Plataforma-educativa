package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.TeacherStatsDTO;
import com.unimar.plataforma_educativa_angular.dto.StudentStatsDTO;
import com.unimar.plataforma_educativa_angular.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:4200")
public class StatsController {

    @Autowired
    private StatsService statsService;

    /**
     * Estadísticas del Profesor
     * GET /api/stats/teacher
     */
    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherStats(Authentication auth) {
        try {
            System.out.println("\n========================================");
            System.out.println("OBTENIENDO ESTADÍSTICAS DEL PROFESOR");
            System.out.println("========================================");
            System.out.println("   • Email: " + auth.getName());

            TeacherStatsDTO stats = statsService.getTeacherStats(auth.getName());

            System.out.println("\n   Estadísticas calculadas:");
            System.out.println("      • Total Cursos: " + stats.getTotalCourses());
            System.out.println("      • Total Estudiantes: " + stats.getTotalStudents());
            System.out.println("      • Total Ejercicios: " + stats.getTotalExercises());
            System.out.println("      • Total Retos: " + stats.getTotalChallenges());
            System.out.println("      • Entregas Pendientes: " + stats.getPendingSubmissions());
            System.out.println("========================================\n");

            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            System.err.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Estadísticas del Estudiante
     * GET /api/stats/student
     */
    @GetMapping("/student")
    public ResponseEntity<?> getStudentStats(Authentication auth) {
        try {
            System.out.println("\n========================================");
            System.out.println("OBTENIENDO ESTADÍSTICAS DEL ESTUDIANTE");
            System.out.println("========================================");
            System.out.println("   • Email: " + auth.getName());

            StudentStatsDTO stats = statsService.getStudentStats(auth.getName());

            System.out.println("\n   Estadísticas calculadas:");
            System.out.println("      • Cursos Activos: " + stats.getEnrolledCourses());
            System.out.println("      • XP Total: " + stats.getTotalXP());
            System.out.println("      • Ejercicios Completados: " + stats.getCompletedExercises());
            System.out.println("      • Retos Superados: " + stats.getCompletedChallenges());
            System.out.println("========================================\n");

            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            System.err.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Progreso de un estudiante en un curso específico
     * GET /api/stats/course/{courseId}/progress
     */
    @GetMapping("/course/{courseId}/progress")
    public ResponseEntity<?> getCourseProgress(
            @PathVariable Long courseId,
            Authentication auth) {
        try {
            System.out.println("\n========================================");
            System.out.println("OBTENIENDO PROGRESO EN CURSO");
            System.out.println("========================================");
            System.out.println("   • Curso ID: " + courseId);
            System.out.println("   • Estudiante: " + auth.getName());

            Map<String, Object> progress = statsService.getCourseProgress(courseId, auth.getName());

            System.out.println("\n   Progreso calculado:");
            System.out.println("      • Progreso: " + progress.get("progressPercentage") + "%");
            System.out.println("      • Completadas: " + progress.get("completedActivities") + "/"
                    + progress.get("totalActivities"));
            System.out.println("      • XP Ganado: " + progress.get("earnedXP"));
            System.out.println("========================================\n");

            return ResponseEntity.ok(progress);
        } catch (RuntimeException e) {
            System.err.println("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}