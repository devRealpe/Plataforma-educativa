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

    // 🔹 Obtener todos los cursos
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // 🔹 Crear curso nuevo
    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course, Authentication auth) {
        // ✅ Buscar por EMAIL (que es lo que está en auth.getName())
        User teacher = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        course.setTeacher(teacher);
        course.setInviteLink("http://localhost:4200/join/" + course.getTitle().replace(" ", "-"));

        return ResponseEntity.ok(courseService.createCourse(course));
    }
}
