package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.dto.CourseDTO;
import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:4200")
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    @Autowired
    public CourseController(CourseService courseService, UserRepository userRepository) {
        this.courseService = courseService;
        this.userRepository = userRepository;
    }

    // Para profesores - Obtener sus cursos
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getMyCourses(Authentication auth) {
        String teacherEmail = auth.getName();
        List<Course> courses = courseService.getCoursesByTeacher(teacherEmail);

        List<CourseDTO> courseDTOs = courses.stream()
                .map(CourseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(courseDTOs);
    }

    // Para estudiantes - Obtener cursos inscritos
    @GetMapping("/enrolled")
    public ResponseEntity<List<CourseDTO>> getEnrolledCourses(Authentication auth) {
        String studentEmail = auth.getName();
        List<Course> courses = courseService.getEnrolledCourses(studentEmail);

        List<CourseDTO> courseDTOs = courses.stream()
                .map(CourseDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(courseDTOs);
    }

    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody Course course, Authentication auth) {
        User teacher = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        course.setTeacher(teacher);
        Course createdCourse = courseService.createCourse(course);

        return ResponseEntity.ok(new CourseDTO(createdCourse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestBody Course course,
            Authentication auth) {
        try {
            Course updatedCourse = courseService.updateCourse(id, course, auth.getName());
            return ResponseEntity.ok(new CourseDTO(updatedCourse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Authentication auth) {
        try {
            courseService.deleteCourse(id, auth.getName());
            return ResponseEntity.ok(Map.of("message", "Curso eliminado exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinCourse(
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            String inviteCode = request.get("inviteCode");
            Course course = courseService.joinCourse(inviteCode, auth.getName());

            CourseDTO courseDTO = new CourseDTO(course);

            return ResponseEntity.ok(Map.of(
                    "message", "Te has unido al curso exitosamente",
                    "course", courseDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leaveCourse(
            @PathVariable Long id,
            Authentication auth) {
        try {
            courseService.leaveCourse(id, auth.getName());
            return ResponseEntity.ok(Map.of(
                    "message", "Has abandonado el curso exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener estudiantes de un curso (Profesor)
     */
    @GetMapping("/{id}/students")
    public ResponseEntity<?> getStudentsByCourse(
            @PathVariable Long id,
            Authentication auth) {
        try {
            List<User> students = courseService.getStudentsByCourse(id, auth.getName());

            // Mapear a un DTO sin información sensible
            List<Map<String, Object>> studentDTOs = students.stream()
                    .map(student -> {
                        Map<String, Object> dto = new java.util.HashMap<>();
                        dto.put("id", student.getId());
                        dto.put("nombre", student.getNombre());
                        dto.put("email", student.getEmail());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(studentDTOs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Eliminar estudiante de un curso (Profesor)
     */
    @DeleteMapping("/{courseId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromCourse(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            Authentication auth) {
        try {
            courseService.removeStudentFromCourse(courseId, studentId, auth.getName());
            return ResponseEntity.ok(Map.of(
                    "message", "Estudiante eliminado del curso exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================
    // AGREGAR ESTOS MÉTODOS AL FINAL DE CourseController.java
    // ========================================

    // ========================================
    // ✅ NUEVO: Endpoints para gestionar WhatsApp
    // ========================================

    /**
     * Agregar o actualizar enlace de WhatsApp (Profesor)
     * PUT /api/courses/{id}/whatsapp
     * Body: { "whatsappLink": "https://chat.whatsapp.com/..." }
     */
    @PutMapping("/{id}/whatsapp")
    public ResponseEntity<?> setWhatsappLink(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            String whatsappLink = request.get("whatsappLink");

            if (whatsappLink == null || whatsappLink.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El enlace de WhatsApp es requerido"));
            }

            Course course = courseService.setWhatsappLink(id, whatsappLink, auth.getName());

            return ResponseEntity.ok(Map.of(
                    "message", "Enlace de WhatsApp configurado exitosamente",
                    "course", new CourseDTO(course)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Eliminar enlace de WhatsApp (Profesor)
     * DELETE /api/courses/{id}/whatsapp
     */
    @DeleteMapping("/{id}/whatsapp")
    public ResponseEntity<?> removeWhatsappLink(
            @PathVariable Long id,
            Authentication auth) {
        try {
            Course course = courseService.removeWhatsappLink(id, auth.getName());

            return ResponseEntity.ok(Map.of(
                    "message", "Enlace de WhatsApp eliminado exitosamente",
                    "course", new CourseDTO(course)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener enlace de WhatsApp (Estudiante o Profesor)
     * GET /api/courses/{id}/whatsapp
     */
    @GetMapping("/{id}/whatsapp")
    public ResponseEntity<?> getWhatsappLink(
            @PathVariable Long id,
            Authentication auth) {
        try {
            String whatsappLink = courseService.getWhatsappLink(id, auth.getName());

            if (whatsappLink == null) {
                return ResponseEntity.ok(Map.of(
                        "hasLink", false,
                        "message", "Este curso no tiene un grupo de WhatsApp configurado"));
            }

            return ResponseEntity.ok(Map.of(
                    "hasLink", true,
                    "whatsappLink", whatsappLink));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}