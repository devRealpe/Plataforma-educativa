package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.entities.Role;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @InjectMocks
    private CourseService courseService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;

    @BeforeEach
    void setUp() {
        // Configurar datos de prueba
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

    // ========================================
    // HU5: Pruebas de Creación de Curso
    // ========================================

    @Test
    @DisplayName("CP005 - HU5: Creación exitosa de curso con datos válidos")
    void testCreateCourse_Success() {
        // Arrange
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

        // Simular que no existe ningún código duplicado
        when(courseRepository.existsByInviteCode(anyString())).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        // Act
        Course result = courseService.createCourse(courseToCreate);

        // Assert
        assertNotNull(result, "El curso creado no debe ser nulo");
        assertNotNull(result.getInviteCode(), "El código de invitación debe generarse");
        assertEquals(8, result.getInviteCode().length(), "El código debe tener 8 caracteres");
        assertEquals("Matemáticas I", result.getTitle(), "El título debe coincidir");
        assertEquals("Curso básico de álgebra", result.getDescription(), "La descripción debe coincidir");
        assertEquals("Básico", result.getLevel(), "El nivel debe coincidir");

        // Verificar que se llamó al repositorio
        verify(courseRepository, times(1)).save(any(Course.class));
        verify(courseRepository, atLeastOnce()).existsByInviteCode(anyString());

        System.out.println("✅ CP005 PASÓ: Curso creado exitosamente con código: " + result.getInviteCode());
    }

    @Test
    @DisplayName("HU5: El código de invitación generado debe ser único")
    void testCreateCourse_GeneratesUniqueInviteCode() {
        // Arrange
        Course courseToCreate = new Course();
        courseToCreate.setTitle("Matemáticas I");
        courseToCreate.setDescription("Curso básico de álgebra");
        courseToCreate.setLevel("Básico");

        // Simular que el primer código ya existe, pero el segundo no
        when(courseRepository.existsByInviteCode(anyString()))
                .thenReturn(true) // Primera vez: código duplicado
                .thenReturn(false); // Segunda vez: código único

        Course savedCourse = new Course();
        savedCourse.setId(1L);
        savedCourse.setInviteCode("UNIQUE12");
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        // Act
        Course result = courseService.createCourse(courseToCreate);

        // Assert
        assertNotNull(result.getInviteCode());
        verify(courseRepository, atLeast(2)).existsByInviteCode(anyString());

        System.out.println("✅ Código único generado: " + result.getInviteCode());
    }

    // ========================================
    // HU6: Pruebas de Unirse a Curso
    // ========================================

    @Test
    @DisplayName("CP006-01 - HU6: Acceso exitoso con código válido")
    void testJoinCourse_WithValidCode_Success() {
        // Arrange
        String inviteCode = "ABC123";
        String studentEmail = "student@test.com";

        testCourse.setId(1L);
        testCourse.setInviteCode(inviteCode);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(studentEmail)).thenReturn(Optional.of(testStudent));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // Act
        Course result = courseService.joinCourse(inviteCode, studentEmail);

        // Assert
        assertNotNull(result, "El curso no debe ser nulo");
        assertTrue(result.getStudents().contains(testStudent), "El estudiante debe estar inscrito");
        assertEquals(1, result.getStudents().size(), "Debe haber 1 estudiante inscrito");

        // Verificar interacciones
        verify(courseRepository, times(1)).findByInviteCode(inviteCode);
        verify(userRepository, times(1)).findByEmail(studentEmail);
        verify(courseRepository, times(1)).save(testCourse);

        System.out.println("✅ CP006-01 PASÓ: Estudiante inscrito exitosamente al curso");
    }

    @Test
    @DisplayName("CP006-02 - HU6: Intento de unión a curso ya inscrito")
    void testJoinCourse_AlreadyEnrolled_ThrowsException() {
        // Arrange
        String inviteCode = "ABC123";
        String studentEmail = "student@test.com";

        testCourse.setId(1L);
        testCourse.setInviteCode(inviteCode);
        testCourse.getStudents().add(testStudent); // Ya está inscrito

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(studentEmail)).thenReturn(Optional.of(testStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(inviteCode, studentEmail),
                "Debe lanzar excepción cuando el estudiante ya está inscrito");

        assertEquals("Ya estás inscrito en este curso", exception.getMessage());

        // Verificar que NO se guardó el curso
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("✅ CP006-02 PASÓ: Sistema previene inscripción duplicada");
        System.out.println("   Mensaje: " + exception.getMessage());
    }

    @Test
    @DisplayName("HU6: Código inválido debe lanzar excepción")
    void testJoinCourse_WithInvalidCode_ThrowsException() {
        // Arrange
        String invalidCode = "INVALID";
        String studentEmail = "student@test.com";

        when(courseRepository.findByInviteCode(invalidCode)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(invalidCode, studentEmail));

        assertEquals("Código inválido", exception.getMessage());
        verify(courseRepository, times(1)).findByInviteCode(invalidCode);
        verify(userRepository, never()).findByEmail(anyString());

        System.out.println("✅ Código inválido manejado correctamente");
    }

    @Test
    @DisplayName("HU6: Solo estudiantes pueden unirse a cursos")
    void testJoinCourse_OnlyStudentsCanJoin() {
        // Arrange
        String inviteCode = "ABC123";
        testCourse.setInviteCode(inviteCode);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(testTeacher.getEmail())).thenReturn(Optional.of(testTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(inviteCode, testTeacher.getEmail()));

        assertEquals("Solo los estudiantes pueden unirse a cursos", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("✅ Sistema valida que solo estudiantes pueden inscribirse");
    }

    @Test
    @DisplayName("HU6: Usuario no encontrado debe lanzar excepción")
    void testJoinCourse_UserNotFound_ThrowsException() {
        // Arrange
        String inviteCode = "ABC123";
        String nonExistentEmail = "noexiste@test.com";
        testCourse.setInviteCode(inviteCode);

        when(courseRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.joinCourse(inviteCode, nonExistentEmail));

        assertEquals("Estudiante no encontrado", exception.getMessage());

        System.out.println("✅ Sistema maneja usuario no encontrado correctamente");
    }
}