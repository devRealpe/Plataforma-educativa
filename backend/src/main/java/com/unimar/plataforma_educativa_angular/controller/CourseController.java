package com.unimar.plataforma_educativa_angular.controller;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

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

    @GetMapping
    public ResponseEntity<List<Course>> getMyCourses(Authentication auth) {
        String teacherEmail = auth.getName();
        List<Course> courses = courseService.getCoursesByTeacher(teacherEmail);
        return ResponseEntity.ok(courses);
    }

    // ✅ NUEVO: Endpoint para estudiantes - Obtener cursos inscritos
    @GetMapping("/enrolled")
    public ResponseEntity<List<Course>> getEnrolledCourses(Authentication auth) {
        String studentEmail = auth.getName();
        List<Course> courses = courseService.getEnrolledCourses(studentEmail);
        return ResponseEntity.ok(courses);
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course, Authentication auth) {
        User teacher = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        course.setTeacher(teacher);
        Course createdCourse = courseService.createCourse(course);

        return ResponseEntity.ok(createdCourse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestBody Course course,
            Authentication auth) {
        try {
            Course updatedCourse = courseService.updateCourse(id, course, auth.getName());
            return ResponseEntity.ok(updatedCourse);
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
            return ResponseEntity.ok(Map.of(
                    "message", "Te has unido al curso exitosamente",
                    "course", course));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}