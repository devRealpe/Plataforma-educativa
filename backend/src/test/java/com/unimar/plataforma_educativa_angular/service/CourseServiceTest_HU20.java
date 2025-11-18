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
@DisplayName("Pruebas Unitarias - HU20: Guardar enlace WhatsApp")
class CourseServiceTest_HU20 {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentScoreRepository studentScoreRepository;

    @Mock
    private ChallengeSubmissionRepository challengeSubmissionRepository;

    @InjectMocks
    private CourseService courseService;

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
    @DisplayName("CP020-2: Guardado exitoso de enlace WhatsApp válido")
    void testGuardarEnlaceValido() {
        String validLink = "https://chat.whatsapp.com/ABC123";

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        Course updated = new Course();
        updated.setId(1L);
        updated.setWhatsappLink(validLink);

        when(courseRepository.save(any(Course.class))).thenReturn(updated);

        Course result = courseService.setWhatsappLink(1L, validLink, "teacher@test.com");

        assertNotNull(result);
        assertEquals(validLink, result.getWhatsappLink());
        assertTrue(result.hasWhatsappLink());
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    @DisplayName("CP020-3: Rechazo de enlace inválido")
    void testRechazarEnlaceInvalido() {
        String invalidLink = "enlace-invalido";

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.setWhatsappLink(1L, invalidLink, "teacher@test.com"));

        assertTrue(exception.getMessage().contains("WhatsApp") ||
                exception.getMessage().contains("válido"));
        verify(courseRepository, never()).save(any(Course.class));
    }
}