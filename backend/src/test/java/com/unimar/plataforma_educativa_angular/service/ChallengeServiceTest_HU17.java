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
@DisplayName("Pruebas Unitarias - HU17: Guardar XP según dificultad")
class ChallengeServiceTest_HU17 {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChallengeService challengeService;

    private Course testCourse;
    private User testTeacher;

    @BeforeEach
    void setUp() {
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setRole(Role.TEACHER);

        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
    }

    @Test
    @DisplayName("CP017-1: Guardado exitoso de XP según dificultad AVANZADO")
    void testGuardarXPExitoso() {
        Challenge challenge = new Challenge();
        challenge.setTitle("Reto Avanzado");
        challenge.setDescription("Descripción del reto");
        challenge.setDifficulty("AVANZADO");
        challenge.setMaxBonusPoints(10);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        Challenge saved = new Challenge();
        saved.setId(1L);
        saved.setDifficulty("AVANZADO");
        saved.setMaxBonusPoints(10);
        saved.setCourse(testCourse);
        saved.setActive(true);

        when(challengeRepository.save(any(Challenge.class))).thenReturn(saved);

        Challenge result = challengeService.createChallenge(challenge, 1L, "teacher@test.com", null, null);

        assertNotNull(result);
        assertEquals("AVANZADO", result.getDifficulty());
        assertEquals(10, result.getMaxBonusPoints());
        assertTrue(result.getActive());
        verify(challengeRepository, times(1)).save(any(Challenge.class));
    }
}