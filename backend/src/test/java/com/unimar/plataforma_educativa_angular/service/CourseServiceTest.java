package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.entities.Role;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import com.unimar.plataforma_educativa_angular.repositories.StudentScoreRepository;
import com.unimar.plataforma_educativa_angular.repositories.ChallengeSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas del Servicio de Cursos")
class CourseServiceTest {

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
        testCourse.setTitle("Matemáticas I");
        testCourse.setDescription("Curso básico de álgebra");
        testCourse.setLevel("Básico");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
    }

    @Test
    @DisplayName("CP005 - HU5: Creación exitosa de curso con datos válidos")
    void testCreateCourse_Success() {
        Course courseToCreate = new Course();
        courseToCreate.setTitle("Matemáticas I");
        courseToCreate.setDescription("Curso básico de álgebra");
        courseToCreate.setLevel("Básico");

        Course savedCourse = new Course();
        savedCourse.setId(1L);
        savedCourse.setTitle("Matemáticas I");
        savedCourse.setDescription("Curso básico de álgebra");
        savedCourse.setLevel("Básico");
        savedCourse.setInviteCode("ABC12345");

        when(courseRepository.existsByInviteCode(anyString())).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        Course result = courseService.createCourse(courseToCreate);

        assertNotNull(result);
        assertNotNull(result.getInviteCode());
        assertEquals(8, result.getInviteCode().length());
        assertEquals("Matemáticas I", result.getTitle());
        assertEquals("Curso básico de álgebra", result.getDescription());
        assertEquals("Básico", result.getLevel());

        verify(courseRepository, times(1)).save(any(Course.class));
        verify(courseRepository, atLeastOnce()).existsByInviteCode(anyString());
    }

    @Test
    @DisplayName("HU5: El código de invitación generado debe ser único")
    void testCreateCourse_GeneratesUniqueInviteCode() {
        Course courseToCreate = new Course();
        courseToCreate.setTitle("Matemáticas I");
        courseToCreate.setDescription("Curso básico de álgebra");
        courseToCreate.setLevel("Básico");

        when(courseRepository.existsByInviteCode(anyString()))
                .thenReturn(true)
                .thenReturn(false);

        Course savedCourse = new Course();
        savedCourse.setId(1L);
        savedCourse.setInviteCode("UNIQUE12");
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        Course result = courseService.createCourse(courseToCreate);

        assertNotNull(result.getInviteCode());
        verify(courseRepository, atLeast(2)).existsByInviteCode(anyString());
    }

    @Test
    @DisplayName("CP006-01 - HU6: Acceso exitoso con código válido")
    void testJoinCourse_WithValidCode_Success() {
        String inviteCode = "ABC123";
        String studentEmail = "student@test.com";

        testCourse.setId(1L);
        testCourse.setInviteCode(inviteCode);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(studentEmail)).thenReturn(Optional.of(testStudent));
        when(challengeSubmissionRepository.findByStudentId(2L)).thenReturn(Collections.emptyList());
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        Course result = courseService.joinCourse(inviteCode, studentEmail);

        assertNotNull(result);
        assertTrue(result.getStudents().contains(testStudent));
        assertEquals(1, result.getStudents().size());

        verify(courseRepository, times(1)).findByInviteCode(inviteCode);
        verify(userRepository, times(1)).findByEmail(studentEmail);
        verify(challengeSubmissionRepository, times(1)).findByStudentId(2L);
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    @DisplayName("CP006-02 - HU6: Intento de unión a curso ya inscrito")
    void testJoinCourse_AlreadyEnrolled_ThrowsException() {
        String inviteCode = "ABC123";
        String studentEmail = "student@test.com";

        testCourse.setId(1L);
        testCourse.setInviteCode(inviteCode);
        testCourse.getStudents().add(testStudent);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(studentEmail)).thenReturn(Optional.of(testStudent));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(inviteCode, studentEmail));

        assertEquals("Ya estás inscrito en este curso", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    @DisplayName("HU6: Código inválido debe lanzar excepción")
    void testJoinCourse_WithInvalidCode_ThrowsException() {
        String invalidCode = "INVALID";
        String studentEmail = "student@test.com";

        when(courseRepository.findByInviteCode(invalidCode)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(invalidCode, studentEmail));

        assertEquals("Código inválido", exception.getMessage());
        verify(courseRepository, times(1)).findByInviteCode(invalidCode);
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("HU6: Solo estudiantes pueden unirse a cursos")
    void testJoinCourse_OnlyStudentsCanJoin() {
        String inviteCode = "ABC123";
        testCourse.setInviteCode(inviteCode);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(testTeacher.getEmail())).thenReturn(Optional.of(testTeacher));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(inviteCode, testTeacher.getEmail()));

        assertEquals("Solo los estudiantes pueden unirse a cursos", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    @DisplayName("HU6: Usuario no encontrado debe lanzar excepción")
    void testJoinCourse_UserNotFound_ThrowsException() {
        String inviteCode = "ABC123";
        String nonExistentEmail = "noexiste@test.com";
        testCourse.setInviteCode(inviteCode);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(inviteCode, nonExistentEmail));

        assertEquals("Estudiante no encontrado", exception.getMessage());
    }
}