package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.dto.PodiumDTO;
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
@DisplayName("Pruebas Unitarias - HU19: Mostrar podio")
class PodiumServiceTest_HU19 {

    @Mock
    private StudentScoreRepository studentScoreRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PodiumService podiumService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;

    @BeforeEach
    void setUp() {
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setRole(Role.TEACHER);

        testStudent = new User();
        testStudent.setId(2L);
        testStudent.setEmail("student@test.com");
        testStudent.setNombre("Estudiante Test");
        testStudent.setRole(Role.STUDENT);

        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setLevel("INTERMEDIO");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent);
    }

    @Test
    @DisplayName("CP019-1: Mostrar podio con estudiantes ordenados")
    void testMostrarPodioConEstudiantes() {
        StudentScore score1 = new StudentScore();
        score1.setStudent(testStudent);
        score1.setCourse(testCourse);
        score1.setTotalBonusPoints(100);
        score1.setChallengesCompleted(5);

        List<StudentScore> scores = Arrays.asList(score1);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(studentScoreRepository.findTopStudentsByCourseId(1L)).thenReturn(scores);

        List<PodiumDTO> result = podiumService.getPodiumByCourse(1L, "teacher@test.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(100, result.get(0).getTotalBonusPoints());
        assertEquals(5, result.get(0).getChallengesCompleted());
    }

    @Test
    @DisplayName("CP019-2: Podio vacío sin datos disponibles")
    void testPodioVacio() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(studentScoreRepository.findTopStudentsByCourseId(1L)).thenReturn(Collections.emptyList());

        List<PodiumDTO> result = podiumService.getPodiumByCourse(1L, "teacher@test.com");

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}