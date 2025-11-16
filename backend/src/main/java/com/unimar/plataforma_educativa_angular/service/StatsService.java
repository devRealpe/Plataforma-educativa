package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.dto.StudentStatsDTO;
import com.unimar.plataforma_educativa_angular.dto.TeacherStatsDTO;
import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ExerciseRepository exerciseRepository;
    private final ChallengeRepository challengeRepository;
    private final SubmissionRepository submissionRepository;
    private final ChallengeSubmissionRepository challengeSubmissionRepository;
    private final StudentScoreRepository studentScoreRepository;

    public StatsService(
            UserRepository userRepository,
            CourseRepository courseRepository,
            ExerciseRepository exerciseRepository,
            ChallengeRepository challengeRepository,
            SubmissionRepository submissionRepository,
            ChallengeSubmissionRepository challengeSubmissionRepository,
            StudentScoreRepository studentScoreRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.exerciseRepository = exerciseRepository;
        this.challengeRepository = challengeRepository;
        this.submissionRepository = submissionRepository;
        this.challengeSubmissionRepository = challengeSubmissionRepository;
        this.studentScoreRepository = studentScoreRepository;
    }

    // ========================================
    // ✅ ESTADÍSTICAS DEL PROFESOR
    // ========================================
    public TeacherStatsDTO getTeacherStats(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Obtener todos los cursos del profesor
        List<Course> courses = courseRepository.findByTeacher(teacher);
        int totalCourses = courses.size();

        // Obtener estudiantes únicos (sin duplicados)
        Set<User> uniqueStudents = new HashSet<>();
        for (Course course : courses) {
            uniqueStudents.addAll(course.getStudents());
        }
        int totalStudents = uniqueStudents.size();

        // Contar ejercicios totales
        int totalExercises = 0;
        for (Course course : courses) {
            totalExercises += exerciseRepository.countByCourseId(course.getId());
        }

        // Contar retos totales
        int totalChallenges = 0;
        for (Course course : courses) {
            totalChallenges += challengeRepository.countByCourseId(course.getId());
        }

        // Contar entregas pendientes (sin calificar)
        int pendingSubmissions = 0;
        for (Course course : courses) {
            List<Exercise> exercises = exerciseRepository.findByCourseId(course.getId());
            for (Exercise exercise : exercises) {
                pendingSubmissions += submissionRepository.findByExercise(exercise).stream()
                        .filter(s -> s.getStatus() == Submission.SubmissionStatus.PENDING)
                        .count();
            }
        }

        // Contar soluciones de retos pendientes
        int pendingChallengeReviews = 0;
        for (Course course : courses) {
            List<Challenge> challenges = challengeRepository.findByCourseId(course.getId());
            for (Challenge challenge : challenges) {
                pendingChallengeReviews += challengeSubmissionRepository.findByChallenge(challenge).stream()
                        .filter(s -> s.getStatus() == ChallengeSubmission.SubmissionStatus.PENDING)
                        .count();
            }
        }

        return new TeacherStatsDTO(
                totalCourses,
                totalStudents,
                totalExercises,
                totalChallenges,
                pendingSubmissions,
                pendingChallengeReviews);
    }

    // ========================================
    // ✅ ESTADÍSTICAS DEL ESTUDIANTE
    // ========================================
    public StudentStatsDTO getStudentStats(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        // Cursos en los que está inscrito
        List<Course> enrolledCourses = courseRepository.findAll().stream()
                .filter(course -> course.getStudents().contains(student))
                .collect(Collectors.toList());
        int totalEnrolledCourses = enrolledCourses.size();

        // XP total acumulado en todos los cursos
        int totalXP = 0;
        for (Course course : enrolledCourses) {
            Optional<StudentScore> scoreOpt = studentScoreRepository
                    .findByStudentIdAndCourseId(student.getId(), course.getId());
            if (scoreOpt.isPresent()) {
                totalXP += scoreOpt.get().getTotalBonusPoints();
            }
        }

        // Ejercicios completados (calificados)
        long completedExercises = submissionRepository.findByStudent(student).stream()
                .filter(s -> s.getStatus() == Submission.SubmissionStatus.GRADED)
                .count();

        // Retos completados (revisados con bonificación)
        long completedChallenges = challengeSubmissionRepository.findByStudent(student).stream()
                .filter(s -> s.getStatus() == ChallengeSubmission.SubmissionStatus.REVIEWED)
                .count();

        return new StudentStatsDTO(
                totalEnrolledCourses,
                totalXP,
                (int) completedExercises,
                (int) completedChallenges);
    }

    // ========================================
    // ✅ PROGRESO EN UN CURSO ESPECÍFICO
    // ========================================
    public Map<String, Object> getCourseProgress(Long courseId, String studentEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!course.getStudents().contains(student)) {
            throw new RuntimeException("No estás inscrito en este curso");
        }

        // Total de actividades
        int totalExercises = (int) exerciseRepository.countByCourseId(courseId);
        int totalChallenges = (int) challengeRepository.countByCourseIdAndActiveTrue(courseId);
        int totalActivities = totalExercises + totalChallenges;

        // Actividades completadas
        long completedExercises = submissionRepository.findByStudent(student).stream()
                .filter(s -> s.getExercise().getCourse().getId().equals(courseId))
                .filter(s -> s.getStatus() == Submission.SubmissionStatus.GRADED)
                .count();

        long completedChallenges = challengeSubmissionRepository.findByStudent(student).stream()
                .filter(s -> s.getChallenge().getCourse().getId().equals(courseId))
                .filter(s -> s.getStatus() == ChallengeSubmission.SubmissionStatus.REVIEWED)
                .count();

        int completedActivities = (int) (completedExercises + completedChallenges);

        // Calcular porcentaje de progreso
        double progressPercentage = totalActivities > 0
                ? (completedActivities * 100.0 / totalActivities)
                : 0.0;

        // XP ganado en este curso
        int earnedXP = 0;
        Optional<StudentScore> scoreOpt = studentScoreRepository
                .findByStudentIdAndCourseId(student.getId(), courseId);
        if (scoreOpt.isPresent()) {
            earnedXP = scoreOpt.get().getTotalBonusPoints();
        }

        Map<String, Object> progress = new HashMap<>();
        progress.put("courseId", courseId);
        progress.put("courseTitle", course.getTitle());
        progress.put("totalExercises", totalExercises);
        progress.put("totalChallenges", totalChallenges);
        progress.put("totalActivities", totalActivities);
        progress.put("completedExercises", (int) completedExercises);
        progress.put("completedChallenges", (int) completedChallenges);
        progress.put("completedActivities", completedActivities);
        progress.put("progressPercentage", Math.round(progressPercentage * 100.0) / 100.0);
        progress.put("earnedXP", earnedXP);

        return progress;
    }
}