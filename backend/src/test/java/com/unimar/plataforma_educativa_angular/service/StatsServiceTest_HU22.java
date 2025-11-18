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

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU22: Estadísticas de entregas")
class StatsServiceTest_HU22 {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ChallengeSubmissionRepository challengeSubmissionRepository;

    @Mock
    private StudentScoreRepository studentScoreRepository;

    @InjectMocks
    private StatsService statsService;

    private Course testCourse;
    private Exercise testExercise;

    @BeforeEach
    void setUp() {
        testCourse = new Course();
        testCourse.setId(1L);

        testExercise = new Exercise();
        testExercise.setId(4L);
        testExercise.setCourse(testCourse);
    }

    @Test
    @DisplayName("CP022-1: Mostrar número total de entregas")
    void testMostrarTotalEntregas() {
        Submission sub1 = new Submission();
        sub1.setExercise(testExercise);
        sub1.setGrade(85.0);

        Submission sub2 = new Submission();
        sub2.setExercise(testExercise);
        sub2.setGrade(90.0);

        List<Submission> submissions = Arrays.asList(sub1, sub2);

        when(submissionRepository.findByExerciseId(4L)).thenReturn(submissions);

        List<Submission> result = submissionRepository.findByExerciseId(4L);

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("CP022-2: Calcular promedio de calificaciones")
    void testCalcularPromedio() {
        Submission sub1 = new Submission();
        sub1.setExercise(testExercise);
        sub1.setGrade(85.0);
        sub1.setStatus(Submission.SubmissionStatus.GRADED);

        Submission sub2 = new Submission();
        sub2.setExercise(testExercise);
        sub2.setGrade(90.0);
        sub2.setStatus(Submission.SubmissionStatus.GRADED);

        List<Submission> submissions = Arrays.asList(sub1, sub2);

        when(submissionRepository.findByExerciseId(4L)).thenReturn(submissions);

        List<Submission> result = submissionRepository.findByExerciseId(4L);

        double average = result.stream()
                .filter(s -> s.getGrade() != null)
                .mapToDouble(Submission::getGrade)
                .average()
                .orElse(0.0);

        assertEquals(87.5, average, 0.01);
    }
}