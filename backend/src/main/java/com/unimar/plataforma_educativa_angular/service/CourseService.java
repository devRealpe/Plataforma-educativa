package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public List<Course> getCoursesByTeacher(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        return courseRepository.findByTeacher(teacher);
    }

    // ✅ NUEVO: Obtener cursos en los que el estudiante está inscrito
    @Transactional
    public List<Course> getEnrolledCourses(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        // Obtener todos los cursos donde el estudiante está en la lista de estudiantes
        return courseRepository.findAll().stream()
                .filter(course -> course.getStudents().contains(student))
                .collect(Collectors.toList());
    }

    @Transactional
    public Course createCourse(Course course) {
        String inviteCode = generateUniqueCode();
        course.setInviteCode(inviteCode);
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long courseId, Course courseData, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!course.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("No tienes permiso para editar este curso");
        }

        course.setTitle(courseData.getTitle());
        course.setDescription(courseData.getDescription());
        course.setLevel(courseData.getLevel());

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!course.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("No tienes permiso para eliminar este curso");
        }

        courseRepository.delete(course);
    }

    private String generateUniqueCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        String code;

        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (courseRepository.existsByInviteCode(code));

        return code;
    }

    @Transactional
    public Course joinCourse(String inviteCode, String studentEmail) {
        Course course = courseRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Código inválido"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!student.getRole().name().equals("STUDENT")) {
            throw new RuntimeException("Solo los estudiantes pueden unirse a cursos");
        }

        // ✅ Verificar si ya está inscrito
        if (course.getStudents().contains(student)) {
            throw new RuntimeException("Ya estás inscrito en este curso");
        }

        course.getStudents().add(student);
        return courseRepository.save(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado con id: " + id));
    }
}