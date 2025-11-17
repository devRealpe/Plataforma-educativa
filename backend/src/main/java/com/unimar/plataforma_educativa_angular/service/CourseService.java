package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.entities.ChallengeSubmission;
import com.unimar.plataforma_educativa_angular.entities.StudentScore;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import com.unimar.plataforma_educativa_angular.repositories.StudentScoreRepository;
import com.unimar.plataforma_educativa_angular.repositories.ChallengeSubmissionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final StudentScoreRepository studentScoreRepository;
    private final ChallengeSubmissionRepository challengeSubmissionRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository,
            StudentScoreRepository studentScoreRepository,
            ChallengeSubmissionRepository challengeSubmissionRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.studentScoreRepository = studentScoreRepository;
        this.challengeSubmissionRepository = challengeSubmissionRepository;
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
        System.out.println("\n========================================");
        System.out.println(" ESTUDIANTE UNIÉNDOSE A CURSO");
        System.out.println("========================================");

        Course course = courseRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Código inválido"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        System.out.println("    Curso: " + course.getTitle());
        System.out.println("    Estudiante: " + student.getNombre() + " (ID: " + student.getId() + ")");

        if (!student.getRole().name().equals("STUDENT")) {
            throw new RuntimeException("Solo los estudiantes pueden unirse a cursos");
        }

        if (course.getStudents().contains(student)) {
            throw new RuntimeException("Ya estás inscrito en este curso");
        }

        course.getStudents().add(student);
        Course savedCourse = courseRepository.save(course);
        System.out.println("    Estudiante agregado al curso");

        // Verificar si tiene entregas revisadas anteriores
        System.out.println("\n    Verificando entregas de retos anteriores...");

        List<ChallengeSubmission> previousSubmissions = challengeSubmissionRepository
                .findByStudentId(student.getId()).stream()
                .filter(sub -> sub.getChallenge().getCourse().getId().equals(course.getId()))
                .filter(sub -> sub.getStatus() == ChallengeSubmission.SubmissionStatus.REVIEWED)
                .filter(sub -> sub.getBonusPoints() != null && sub.getBonusPoints() > 0)
                .toList();

        if (!previousSubmissions.isEmpty()) {
            System.out.println("    Encontradas " + previousSubmissions.size() + " entregas revisadas anteriores");

            // Recalcular puntuación total
            int totalPoints = 0;
            int totalChallenges = 0;

            for (ChallengeSubmission sub : previousSubmissions) {
                totalPoints += sub.getBonusPoints();
                totalChallenges++;
                System.out.println("      • Reto: " + sub.getChallenge().getTitle() +
                        " → " + sub.getBonusPoints() + " XP");
            }

            // Crear o actualizar registro en student_scores
            StudentScore score = studentScoreRepository
                    .findByStudentIdAndCourseId(student.getId(), course.getId())
                    .orElse(new StudentScore());

            score.setStudent(student);
            score.setCourse(course);
            score.setTotalBonusPoints(totalPoints);
            score.setChallengesCompleted(totalChallenges);

            studentScoreRepository.save(score);

            System.out.println("\n    Puntuación restaurada en el podio:");
            System.out.println("      • Total XP: " + totalPoints);
            System.out.println("      • Retos completados: " + totalChallenges);
        } else {
            System.out.println("    No hay entregas revisadas anteriores");
            System.out.println("    El estudiante empezará con 0 XP en el podio");
        }

        System.out.println("========================================");
        System.out.println(" INSCRIPCIÓN COMPLETADA");
        System.out.println("========================================\n");

        return savedCourse;
    }

    // ========================================
    // Eliminar puntuación al salir
    // ========================================
    @Transactional
    public void leaveCourse(Long courseId, String studentEmail) {
        System.out.println("\n========================================");
        System.out.println(" ESTUDIANTE ABANDONANDO CURSO");
        System.out.println("========================================");

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        System.out.println("    Curso: " + course.getTitle());
        System.out.println("   Estudiante: " + student.getNombre());

        if (!student.getRole().name().equals("STUDENT")) {
            throw new RuntimeException("Solo los estudiantes pueden abandonar cursos");
        }

        if (!course.getStudents().contains(student)) {
            throw new RuntimeException("No estás inscrito en este curso");
        }

        // Eliminar puntuación del podio
        studentScoreRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .ifPresent(score -> {
                    System.out.println("   Eliminando puntuación del podio:");
                    System.out.println("      • Puntos: " + score.getTotalBonusPoints() + " XP");
                    System.out.println("      • Retos completados: " + score.getChallengesCompleted());
                    studentScoreRepository.delete(score);
                    System.out.println("      Puntuación eliminada exitosamente");
                });

        course.getStudents().remove(student);
        courseRepository.save(course);

        System.out.println("    Estudiante eliminado del curso");
        System.out.println("    Sus entregas se mantienen guardadas");
        System.out.println("========================================\n");
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado con id: " + id));
    }

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

    // ========================================
    // Eliminar puntuación al remover estudiante
    // ========================================
    @Transactional
    public void removeStudentFromCourse(Long courseId, Long studentId, String teacherEmail) {
        System.out.println("\n========================================");
        System.out.println(" PROFESOR ELIMINANDO ESTUDIANTE");
        System.out.println("========================================");

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        System.out.println("    Curso: " + course.getTitle());
        System.out.println("    Profesor: " + teacher.getNombre());

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar estudiantes de este curso");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        System.out.println("   👤 Estudiante a eliminar: " + student.getNombre());

        if (!course.getStudents().contains(student)) {
            throw new RuntimeException("El estudiante no está inscrito en este curso");
        }

        // Eliminar puntuación del podio
        studentScoreRepository.findByStudentIdAndCourseId(studentId, courseId)
                .ifPresent(score -> {
                    System.out.println("    Eliminando puntuación del podio:");
                    System.out.println("      • Puntos: " + score.getTotalBonusPoints() + " XP");
                    System.out.println("      • Retos completados: " + score.getChallengesCompleted());
                    studentScoreRepository.delete(score);
                    System.out.println("       Puntuación eliminada exitosamente");
                });

        course.getStudents().remove(student);
        courseRepository.save(course);

        System.out.println("    Estudiante eliminado del curso");
        System.out.println("    Sus entregas se mantienen guardadas");
        System.out.println("========================================\n");
    }

    // ========================================
    // GESTIÓN DE WHATSAPP (sin cambios)
    // ========================================

    private void validateWhatsappLink(String link) {
        if (link == null || link.trim().isEmpty()) {
            return;
        }

        String linkTrimmed = link.trim();

        if (linkTrimmed.length() > 500) {
            throw new RuntimeException("El enlace es demasiado largo (máximo 500 caracteres)");
        }

        if (!linkTrimmed.toLowerCase().startsWith("https://chat.whatsapp.com/") &&
                !linkTrimmed.toLowerCase().startsWith("https://wa.me/")) {
            throw new RuntimeException(
                    "El enlace debe ser un enlace válido de WhatsApp (https://chat.whatsapp.com/ o https://wa.me/)");
        }
    }

    @Transactional
    public Course setWhatsappLink(Long courseId, String whatsappLink, String teacherEmail) {
        System.out.println("\n========================================");
        System.out.println(" CONFIGURANDO ENLACE DE WHATSAPP");
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

        validateWhatsappLink(whatsappLink);

        course.setWhatsappLink(whatsappLink != null ? whatsappLink.trim() : null);
        Course updated = courseRepository.save(course);

        System.out.println("   Enlace configurado exitosamente");
        System.out.println("   • Tiene enlace: " + updated.hasWhatsappLink());
        System.out.println("========================================\n");

        return updated;
    }

    @Transactional
    public Course removeWhatsappLink(Long courseId, String teacherEmail) {
        System.out.println("\n========================================");
        System.out.println(" ELIMINANDO ENLACE DE WHATSAPP");
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

        System.out.println("    Enlace eliminado exitosamente");
        System.out.println("========================================\n");

        return updated;
    }

    public String getWhatsappLink(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isTeacher = course.getTeacher().getId().equals(user.getId());
        boolean isStudent = course.getStudents().contains(user);

        if (!isTeacher && !isStudent) {
            throw new RuntimeException("No tienes acceso a este curso");
        }

        if (!course.hasWhatsappLink()) {
            return null;
        }

        return course.getWhatsappLink();
    }
}