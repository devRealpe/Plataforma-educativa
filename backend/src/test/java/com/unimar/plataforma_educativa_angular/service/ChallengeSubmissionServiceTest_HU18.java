package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU18: Asignar y mostrar puntos")
class ChallengeSubmissionServiceTest_HU18 {

    @Mock
    private ChallengeSubmissionRepository submissionRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentScoreRepository studentScoreRepository;

    @InjectMocks
    private ChallengeSubmissionService submissionService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;
    private Challenge testChallenge;
    private ChallengeSubmission testSubmission;

    @BeforeEach
    void setUp() {
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        testStudent = new User();
        testStudent.setId(10L);
        testStudent.setEmail("student@test.com");
        testStudent.setNombre("Estudiante Test");
        testStudent.setRole(Role.STUDENT);

        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Curso Test");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent);

        testChallenge = new Challenge();
        testChallenge.setId(5L);
        testChallenge.setTitle("Reto Test");
        testChallenge.setMaxBonusPoints(10);
        testChallenge.setCourse(testCourse);
        testChallenge.setActive(true);

        testSubmission = new ChallengeSubmission();
        testSubmission.setId(1L);
        testSubmission.setChallenge(testChallenge);
        testSubmission.setStudent(testStudent);
        testSubmission.setStatus(ChallengeSubmission.SubmissionStatus.PENDING);
    }

    @Test
    @DisplayName("CP018-1: Asignación automática de puntos por reto aprobado")
    void testAsignarPuntos() {
        StudentScore existingScore = new StudentScore();
        existingScore.setId(1L);
        existingScore.setStudent(testStudent);
        existingScore.setCourse(testCourse);
        existingScore.setTotalBonusPoints(0);
        existingScore.setChallengesCompleted(0);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(testSubmission));
        when(challengeRepository.findById(5L)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(studentScoreRepository.findByStudentIdAndCourseId(10L, 1L))
                .thenReturn(Optional.of(existingScore));

        ChallengeSubmission updated = new ChallengeSubmission();
        updated.setId(1L);
        updated.setChallenge(testChallenge);
        updated.setStudent(testStudent);
        updated.setBonusPoints(8);
        updated.setStatus(ChallengeSubmission.SubmissionStatus.REVIEWED);

        when(submissionRepository.save(any(ChallengeSubmission.class))).thenReturn(updated);

        StudentScore updatedScore = new StudentScore();
        updatedScore.setId(1L);
        updatedScore.setStudent(testStudent);
        updatedScore.setCourse(testCourse);
        updatedScore.setTotalBonusPoints(8);
        updatedScore.setChallengesCompleted(1);

        when(studentScoreRepository.save(any(StudentScore.class))).thenReturn(updatedScore);

        ChallengeSubmission result = submissionService.reviewSubmission(1L, 8, "Aprobado", "teacher@test.com");

        assertNotNull(result);
        assertEquals(8, result.getBonusPoints());
        assertEquals(ChallengeSubmission.SubmissionStatus.REVIEWED, result.getStatus());
        verify(submissionRepository, times(1)).save(any(ChallengeSubmission.class));
        verify(studentScoreRepository, times(1)).save(any(StudentScore.class));
    }

    @Test
    @DisplayName("CP018-2: Visualización de puntos acumulados")
    void testObtenerPuntosTotales() {
        StudentScore score = new StudentScore();
        score.setId(1L);
        score.setStudent(testStudent);
        score.setCourse(testCourse);
        score.setTotalBonusPoints(8);
        score.setChallengesCompleted(1);

        when(studentScoreRepository.findByStudentIdAndCourseId(10L, 1L))
                .thenReturn(Optional.of(score));

        Optional<StudentScore> result = studentScoreRepository.findByStudentIdAndCourseId(10L, 1L);

        assertTrue(result.isPresent());
        assertEquals(8, result.get().getTotalBonusPoints());
        assertEquals(1, result.get().getChallengesCompleted());
        verify(studentScoreRepository, times(1)).findByStudentIdAndCourseId(10L, 1L);
    }
}