package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // 🔹 Obtener todos los cursos
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // 🔹 Crear un curso con link único
    @Transactional
    public Course createCourse(Course course) {
        // Generar un link único usando UUID
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String formattedTitle = course.getTitle().replace(" ", "-").toLowerCase();

        course.setInviteLink("http://localhost:4200/join/" + formattedTitle + "-" + uniqueId);

        return courseRepository.save(course);
    }

    // 🔹 (opcional) Obtener curso por ID
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado con id: " + id));
    }
}
