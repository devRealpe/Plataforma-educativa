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
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que el usuario tenga acceso al curso
        boolean hasAccess = course.getTeacher().getId().equals(user.getId()) ||
                course.getStudents().contains(user);

        if (!hasAccess) {
            throw new RuntimeException("No tienes acceso a este curso");
        }

        List<StudentScore> topScores = studentScoreRepository.findTopStudentsByCourseId(courseId);

        // Limitar a los primeros 10 estudiantes
        List<StudentScore> top10 = topScores.stream()
                .limit(10)
                .collect(Collectors.toList());

        List<PodiumDTO> podium = new ArrayList<>();
        for (int i = 0; i < top10.size(); i++) {
            podium.add(new PodiumDTO(top10.get(i), i + 1));
        }

        return podium;
    }

    /**
     * Obtener podio por nivel de curso
     */
    public List<PodiumDTO> getPodiumByLevel(String level, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Obtener todos los cursos del nivel especificado donde el usuario tiene acceso
        List<Course> coursesOfLevel = courseRepository.findAll().stream()
                .filter(course -> course.getLevel().equalsIgnoreCase(level))
                .filter(course -> course.getTeacher().getId().equals(user.getId()) ||
                        course.getStudents().contains(user))
                .collect(Collectors.toList());

        if (coursesOfLevel.isEmpty()) {
            throw new RuntimeException("No tienes acceso a cursos de nivel " + level);
        }

        // Obtener todos los scores de esos cursos
        List<StudentScore> allScores = new ArrayList<>();
        for (Course course : coursesOfLevel) {
            allScores.addAll(studentScoreRepository.findByCourseId(course.getId()));
        }

        // Ordenar por puntos totales y retos completados
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

        return podium;
    }

    /**
     * Obtener posición de un estudiante en el podio
     */
    public PodiumDTO getStudentPosition(Long courseId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        if (!course.getStudents().contains(student)) {
            throw new RuntimeException("No estás inscrito en este curso");
        }

        StudentScore studentScore = studentScoreRepository
                .findByStudentIdAndCourseId(student.getId(), courseId)
                .orElse(null);

        if (studentScore == null || studentScore.getTotalBonusPoints() == 0) {
            // El estudiante no tiene puntos aún
            PodiumDTO dto = new PodiumDTO();
            dto.setStudentId(student.getId());
            dto.setStudentName(student.getNombre());
            dto.setStudentEmail(student.getEmail());
            dto.setTotalBonusPoints(0);
            dto.setChallengesCompleted(0);
            dto.setPosition(null); // Sin posición
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

        return new PodiumDTO(studentScore, position);
    }
}