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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU21: Visualizar enlace WhatsApp")
class CourseServiceTest_HU21 {

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
    private User testStudent;

    @BeforeEach
    void setUp() {
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        testStudent = new User();
        testStudent.setId(2L);
        testStudent.setEmail("student@test.com");
        testStudent.setNombre("Estudiante Test");
        testStudent.setRole(Role.STUDENT);

        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Curso Test");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent);
    }

    @Test
    @DisplayName("CP021-1: Enlace visible cuando existe")
    void testEnlaceVisible() {
        String whatsappLink = "https://chat.whatsapp.com/ABC123";
        testCourse.setWhatsappLink(whatsappLink);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        String result = courseService.getWhatsappLink(1L, "student@test.com");

        assertNotNull(result);
        assertEquals(whatsappLink, result);
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("student@test.com");
    }

    @Test
    @DisplayName("CP021-2: Redirección exitosa al grupo")
    void testRedireccionExitosa() {
        String link = "https://chat.whatsapp.com/ABC123";
        testCourse.setWhatsappLink(link);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        String result = courseService.getWhatsappLink(1L, "student@test.com");

        assertEquals(link, result);
        assertTrue(result.startsWith("https://chat.whatsapp.com/"));
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("student@test.com");
    }

    @Test
    @DisplayName("CP021-3: Enlace no configurado")
    void testEnlaceNoConfigurado() {
        testCourse.setWhatsappLink(null);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        String result = courseService.getWhatsappLink(1L, "student@test.com");

        assertNull(result);
        assertFalse(testCourse.hasWhatsappLink());
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("student@test.com");
    }
}