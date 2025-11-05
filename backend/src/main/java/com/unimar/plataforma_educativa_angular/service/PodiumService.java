package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.dto.PodiumDTO;
import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.StudentScore;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.StudentScoreRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PodiumService {

    private final StudentScoreRepository studentScoreRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public PodiumService(
            StudentScoreRepository studentScoreRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.studentScoreRepository = studentScoreRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Obtener podio de un curso específico
     */
    public List<PodiumDTO> getPodiumByCourse(Long courseId, String userEmail) {
        System.out.println("\n========================================");
        System.out.println("🏆 OBTENIENDO PODIO DEL CURSO");
        System.out.println("========================================");
        System.out.println("   Course ID: " + courseId);
        System.out.println("   Usuario: " + userEmail);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    System.err.println("❌ Curso no encontrado con ID: " + courseId);
                    return new RuntimeException("Curso no encontrado");
                });

        System.out.println("   ✅ Curso encontrado: " + course.getTitle());

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    System.err.println("❌ Usuario no encontrado: " + userEmail);
                    return new RuntimeException("Usuario no encontrado");
                });

        System.out.println("   ✅ Usuario encontrado: " + user.getNombre() + " (" + user.getRole() + ")");

        // Verificar acceso
        boolean hasAccess = course.getTeacher().getId().equals(user.getId()) ||
                course.getStudents().contains(user);

        System.out.println("   🔐 Verificando acceso:");
        System.out.println("      • Es profesor: " + course.getTeacher().getId().equals(user.getId()));
        System.out.println("      • Es estudiante: " + course.getStudents().contains(user));
        System.out.println("      • Tiene acceso: " + hasAccess);

        if (!hasAccess) {
            System.err.println("❌ No tienes acceso a este curso");
            throw new RuntimeException("No tienes acceso a este curso");
        }

        System.out.println("\n   📊 Consultando student_scores...");
        List<StudentScore> topScores = studentScoreRepository.findTopStudentsByCourseId(courseId);

        System.out.println("   📋 Resultados de la consulta:");
        System.out.println("      • Registros encontrados: " + topScores.size());

        if (topScores.isEmpty()) {
            System.out.println("      ⚠️ No hay registros en student_scores para este curso");
            System.out.println("========================================\n");
            return new ArrayList<>();
        }

        // Mostrar top 3
        System.out.println("\n   🏅 Top 3 estudiantes:");
        topScores.stream().limit(3).forEach(score -> {
            System.out.println("      • " + score.getStudent().getNombre() +
                    ": " + score.getTotalBonusPoints() + " XP, " +
                    score.getChallengesCompleted() + " retos");
        });

        // Limitar a los primeros 10 estudiantes
        List<StudentScore> top10 = topScores.stream()
                .limit(10)
                .collect(Collectors.toList());

        List<PodiumDTO> podium = new ArrayList<>();
        for (int i = 0; i < top10.size(); i++) {
            podium.add(new PodiumDTO(top10.get(i), i + 1));
        }

        System.out.println("\n   ✅ Podio generado con " + podium.size() + " estudiantes");
        System.out.println("========================================\n");

        return podium;
    }

    /**
     * Obtener podio por nivel de curso
     */
    public List<PodiumDTO> getPodiumByLevel(String level, String userEmail) {
        System.out.println("\n🏆 Obteniendo podio por nivel: " + level);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Course> coursesOfLevel = courseRepository.findAll().stream()
                .filter(course -> course.getLevel().equalsIgnoreCase(level))
                .filter(course -> course.getTeacher().getId().equals(user.getId()) ||
                        course.getStudents().contains(user))
                .collect(Collectors.toList());

        if (coursesOfLevel.isEmpty()) {
            System.out.println("⚠️ No tienes acceso a cursos de nivel " + level);
            throw new RuntimeException("No tienes acceso a cursos de nivel " + level);
        }

        System.out.println("✅ Cursos de nivel " + level + " encontrados: " + coursesOfLevel.size());

        List<StudentScore> allScores = new ArrayList<>();
        for (Course course : coursesOfLevel) {
            allScores.addAll(studentScoreRepository.findByCourseId(course.getId()));
        }

        List<StudentScore> sortedScores = allScores.stream()
                .sorted((s1, s2) -> {
                    int pointsComparison = s2.getTotalBonusPoints().compareTo(s1.getTotalBonusPoints());
                    if (pointsComparison != 0) {
                        return pointsComparison;
                    }
                    return s2.getChallengesCompleted().compareTo(s1.getChallengesCompleted());
                })
                .limit(10)
                .collect(Collectors.toList());

        List<PodiumDTO> podium = new ArrayList<>();
        for (int i = 0; i < sortedScores.size(); i++) {
            podium.add(new PodiumDTO(sortedScores.get(i), i + 1));
        }

        System.out.println("✅ Podio por nivel generado con " + podium.size() + " estudiantes\n");

        return podium;
    }

    /**
     * Obtener posición de un estudiante en el podio
     */
    public PodiumDTO getStudentPosition(Long courseId, String studentEmail) {
        System.out.println("\n📍 Obteniendo posición del estudiante en el podio");
        System.out.println("   Course ID: " + courseId);
        System.out.println("   Estudiante: " + studentEmail);

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!course.getStudents().contains(student)) {
            System.err.println("❌ No estás inscrito en este curso");
            throw new RuntimeException("No estás inscrito en este curso");
        }

        StudentScore studentScore = studentScoreRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .orElse(null);

        if (studentScore == null || studentScore.getTotalBonusPoints() == 0) {
            System.out.println("⚠️ El estudiante no tiene puntos aún");
            PodiumDTO dto = new PodiumDTO();
            dto.setStudentId(student.getId());
            dto.setStudentName(student.getNombre());
            dto.setStudentEmail(student.getEmail());
            dto.setTotalBonusPoints(0);
            dto.setChallengesCompleted(0);
            dto.setPosition(null);
            return dto;
        }

        List<StudentScore> topScores = studentScoreRepository.findTopStudentsByCourseId(courseId);

        int position = -1;
        for (int i = 0; i < topScores.size(); i++) {
            if (topScores.get(i).getStudent().getId().equals(student.getId())) {
                position = i + 1;
                break;
            }
        }

        System.out.println("✅ Posición del estudiante: " + position);

        return new PodiumDTO(studentScore, position);
    }
}