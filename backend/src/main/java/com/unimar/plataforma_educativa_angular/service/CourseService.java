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

    @Transactional
    public List<Course> getEnrolledCourses(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

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

        if (course.getStudents().contains(student)) {
            throw new RuntimeException("Ya estás inscrito en este curso");
        }

        course.getStudents().add(student);
        return courseRepository.save(course);
    }

    @Transactional
    public void leaveCourse(Long courseId, String studentEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!student.getRole().name().equals("STUDENT")) {
            throw new RuntimeException("Solo los estudiantes pueden abandonar cursos");
        }

        if (!course.getStudents().contains(student)) {
            throw new RuntimeException("No estás inscrito en este curso");
        }

        course.getStudents().remove(student);
        courseRepository.save(course);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado con id: " + id));
    }

    /**
     * Obtener lista de estudiantes inscritos en un curso (Profesor)
     */
    @Transactional
    public List<User> getStudentsByCourse(Long courseId, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para ver los estudiantes de este curso");
        }

        return course.getStudents().stream().collect(Collectors.toList());
    }

    /**
     * Eliminar estudiante de un curso (Profesor)
     */
    @Transactional
    public void removeStudentFromCourse(Long courseId, Long studentId, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar estudiantes de este curso");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!course.getStudents().contains(student)) {
            throw new RuntimeException("El estudiante no está inscrito en este curso");
        }

        course.getStudents().remove(student);
        courseRepository.save(course);
    }

    // ========================================
    // AGREGAR ESTOS MÉTODOS AL FINAL DE CourseService.java
    // ========================================

    // ========================================
    // ✅ NUEVO: Gestión de enlace de WhatsApp
    // ========================================

    /**
     * Validar que el enlace sea de WhatsApp
     */
    private void validateWhatsappLink(String link) {
        if (link == null || link.trim().isEmpty()) {
            return; // Link opcional
        }

        String linkTrimmed = link.trim();

        // Validar longitud
        if (linkTrimmed.length() > 500) {
            throw new RuntimeException("El enlace es demasiado largo (máximo 500 caracteres)");
        }

        // Validar que sea un enlace válido de WhatsApp
        if (!linkTrimmed.toLowerCase().startsWith("https://chat.whatsapp.com/") &&
                !linkTrimmed.toLowerCase().startsWith("https://wa.me/")) {
            throw new RuntimeException(
                    "El enlace debe ser un enlace válido de WhatsApp (https://chat.whatsapp.com/ o https://wa.me/)");
        }
    }

    /**
     * Agregar o actualizar enlace de WhatsApp (Profesor)
     */
    @Transactional
    public Course setWhatsappLink(Long courseId, String whatsappLink, String teacherEmail) {
        System.out.println("\n========================================");
        System.out.println("💬 CONFIGURANDO ENLACE DE WHATSAPP");
        System.out.println("========================================");
        System.out.println("   • Curso ID: " + courseId);
        System.out.println("   • Profesor: " + teacherEmail);
        System.out.println("   • Enlace: " + (whatsappLink != null ? whatsappLink : "null"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para modificar este curso");
        }

        // Validar el enlace
        validateWhatsappLink(whatsappLink);

        // Configurar el enlace
        course.setWhatsappLink(whatsappLink != null ? whatsappLink.trim() : null);
        Course updated = courseRepository.save(course);

        System.out.println("   ✅ Enlace configurado exitosamente");
        System.out.println("   • Tiene enlace: " + updated.hasWhatsappLink());
        System.out.println("========================================\n");

        return updated;
    }

    /**
     * Eliminar enlace de WhatsApp (Profesor)
     */
    @Transactional
    public Course removeWhatsappLink(Long courseId, String teacherEmail) {
        System.out.println("\n========================================");
        System.out.println("🗑️ ELIMINANDO ENLACE DE WHATSAPP");
        System.out.println("========================================");
        System.out.println("   • Curso ID: " + courseId);
        System.out.println("   • Profesor: " + teacherEmail);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para modificar este curso");
        }

        course.setWhatsappLink(null);
        Course updated = courseRepository.save(course);

        System.out.println("   ✅ Enlace eliminado exitosamente");
        System.out.println("========================================\n");

        return updated;
    }

    /**
     * Obtener enlace de WhatsApp (Estudiante o Profesor)
     */
    public String getWhatsappLink(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario tenga acceso al curso
        boolean isTeacher = course.getTeacher().getId().equals(user.getId());
        boolean isStudent = course.getStudents().contains(user);

        if (!isTeacher && !isStudent) {
            throw new RuntimeException("No tienes acceso a este curso");
        }

        if (!course.hasWhatsappLink()) {
            return null; // No hay enlace configurado
        }

        return course.getWhatsappLink();
    }
}