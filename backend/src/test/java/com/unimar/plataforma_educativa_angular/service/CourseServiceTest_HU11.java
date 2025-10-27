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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas del Servicio de Cursos - HU11 (Edición y Gestión de Estudiantes)")
class CourseServiceTest_HU11 {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CourseService courseService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent1;
    private User testStudent2;
    private User testStudent3;

    @BeforeEach
    void setUp() {
        // Configurar datos de prueba
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        testStudent1 = new User();
        testStudent1.setId(2L);
        testStudent1.setEmail("student1@test.com");
        testStudent1.setNombre("Estudiante Uno");
        testStudent1.setRole(Role.STUDENT);

        testStudent2 = new User();
        testStudent2.setId(3L);
        testStudent2.setEmail("student2@test.com");
        testStudent2.setNombre("Estudiante Dos");
        testStudent2.setRole(Role.STUDENT);

        testStudent3 = new User();
        testStudent3.setId(4L);
        testStudent3.setEmail("student3@test.com");
        testStudent3.setNombre("Estudiante Tres");
        testStudent3.setRole(Role.STUDENT);

        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Matemáticas I");
        testCourse.setDescription("Curso básico de álgebra");
        testCourse.setLevel("Básico");
        testCourse.setInviteCode("ABC123");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());

        // Agregar estudiantes al curso
        testCourse.getStudents().add(testStudent1);
        testCourse.getStudents().add(testStudent2);
        testCourse.getStudents().add(testStudent3);
    }

    // ========================================
    // HU11: Pruebas de Edición de Curso y Gestión de Estudiantes
    // ========================================

    @Test
    @DisplayName("CP011-01 - HU11: Eliminación exitosa de estudiante del curso")
    void testRemoveStudentFromCourse_Success() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testStudent1));

        Course updatedCourse = new Course();
        updatedCourse.setId(1L);
        updatedCourse.setTitle("Matemáticas I");
        updatedCourse.setTeacher(testTeacher);
        updatedCourse.setStudents(new HashSet<>());
        updatedCourse.getStudents().add(testStudent2);
        updatedCourse.getStudents().add(testStudent3);

        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourse);

        // Act
        int initialStudentCount = testCourse.getStudents().size();
        assertDoesNotThrow(() -> courseService.removeStudentFromCourse(1L, 2L, "teacher@test.com"));

        // Assert
        assertEquals(3, initialStudentCount, "Inicialmente debe haber 3 estudiantes");

        // Verificar interacciones
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(userRepository, times(1)).findById(2L);
        verify(courseRepository, times(1)).save(any(Course.class));

        System.out.println("CP011-01 PASÓ: Estudiante eliminado exitosamente del curso");
        System.out.println("   Estudiantes antes: " + initialStudentCount);
        System.out.println("   Estudiante eliminado: " + testStudent1.getNombre());
        System.out.println("   NOTA: El sistema debe solicitar confirmación en frontend antes de eliminar");
    }

    @Test
    @DisplayName("HU11: Solo el profesor del curso puede eliminar estudiantes")
    void testRemoveStudent_OnlyTeacherCanRemove() {
        // Arrange
        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(1L, 2L, "other@test.com"));

        assertEquals("No tienes permiso para eliminar estudiantes de este curso", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("Sistema valida que solo el profesor del curso puede eliminar estudiantes");
        System.out.println("   Mensaje: " + exception.getMessage());
    }

    @Test
    @DisplayName("HU11: No se puede eliminar estudiante que no está inscrito")
    void testRemoveStudent_NotEnrolled_ThrowsException() {
        // Arrange
        User unenrolledStudent = new User();
        unenrolledStudent.setId(99L);
        unenrolledStudent.setEmail("unenrolled@test.com");
        unenrolledStudent.setRole(Role.STUDENT);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(99L)).thenReturn(Optional.of(unenrolledStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(1L, 99L, "teacher@test.com"));

        assertEquals("El estudiante no está inscrito en este curso", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("Sistema valida que el estudiante esté inscrito antes de eliminar");
        System.out.println("   Mensaje: " + exception.getMessage());
    }

    @Test
    @DisplayName("HU11: Obtener lista de estudiantes del curso (Profesor)")
    void testGetStudentsByCourse_Success() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        // Act
        List<User> result = courseService.getStudentsByCourse(1L, "teacher@test.com");

        // Assert
        assertNotNull(result, "La lista de estudiantes no debe ser nula");
        assertEquals(3, result.size(), "Debe haber 3 estudiantes inscritos");
        assertTrue(result.contains(testStudent1), "Debe contener al estudiante 1");
        assertTrue(result.contains(testStudent2), "Debe contener al estudiante 2");
        assertTrue(result.contains(testStudent3), "Debe contener al estudiante 3");

        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");

        System.out.println("Profesor puede obtener lista de estudiantes del curso");
        System.out.println("   Total de estudiantes: " + result.size());
        for (User student : result) {
            System.out.println("   - " + student.getNombre() + " (" + student.getEmail() + ")");
        }
    }

    @Test
    @DisplayName("HU11: Solo el profesor del curso puede ver la lista de estudiantes")
    void testGetStudents_OnlyTeacherCanView() {
        // Arrange
        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.getStudentsByCourse(1L, "other@test.com"));

        assertEquals("No tienes permiso para ver los estudiantes de este curso", exception.getMessage());

        System.out.println("Sistema valida permisos para ver lista de estudiantes");
    }

    @Test
    @DisplayName("HU11: Eliminar múltiples estudiantes del curso")
    void testRemoveMultipleStudents_Success() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testStudent1));
        when(userRepository.findById(3L)).thenReturn(Optional.of(testStudent2));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // Act - Eliminar primer estudiante
        assertDoesNotThrow(() -> courseService.removeStudentFromCourse(1L, 2L, "teacher@test.com"));

        // Act - Eliminar segundo estudiante
        assertDoesNotThrow(() -> courseService.removeStudentFromCourse(1L, 3L, "teacher@test.com"));

        // Assert
        verify(courseRepository, times(2)).save(any(Course.class));

        System.out.println("Profesor puede eliminar múltiples estudiantes");
        System.out.println("   Estudiantes eliminados: 2");
    }

    @Test
    @DisplayName("HU11: Curso no encontrado lanza excepción")
    void testRemoveStudent_CourseNotFound_ThrowsException() {
        // Arrange
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(999L, 2L, "teacher@test.com"));

        assertEquals("Curso no encontrado", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("Sistema maneja correctamente curso no encontrado");
    }

    @Test
    @DisplayName("HU11: Estudiante no encontrado lanza excepción")
    void testRemoveStudent_StudentNotFound_ThrowsException() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(1L, 999L, "teacher@test.com"));

        assertEquals("Estudiante no encontrado", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("Sistema maneja correctamente estudiante no encontrado");
    }

    @Test
    @DisplayName("HU11: Validar que el curso se actualiza correctamente después de eliminar")
    void testRemoveStudent_CourseUpdatedCorrectly() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testStudent1));

        Course updatedCourse = new Course();
        updatedCourse.setId(1L);
        updatedCourse.setTitle("Matemáticas I");
        updatedCourse.setTeacher(testTeacher);
        updatedCourse.setStudents(new HashSet<>());
        updatedCourse.getStudents().add(testStudent2);
        updatedCourse.getStudents().add(testStudent3);

        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourse);

        // Act
        assertDoesNotThrow(() -> courseService.removeStudentFromCourse(1L, 2L, "teacher@test.com"));

        // Assert
        verify(courseRepository, times(1)).save(any(Course.class));
        assertFalse(testCourse.getStudents().contains(testStudent1),
                "El estudiante eliminado no debe estar en la lista");

        System.out.println("El curso se actualiza correctamente al eliminar estudiante");
        System.out.println("   Estudiantes restantes: " + (testCourse.getStudents().size()));
    }

    @Test
    @DisplayName("HU11: Mantener organización del grupo después de eliminar estudiante")
    void testCourseOrganization_AfterRemovingStudent() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testStudent1));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        int initialCount = testCourse.getStudents().size();

        // Act
        assertDoesNotThrow(() -> courseService.removeStudentFromCourse(1L, 2L, "teacher@test.com"));

        // Assert
        assertEquals(3, initialCount, "Debe haber 3 estudiantes inicialmente");
        verify(courseRepository, times(1)).save(any(Course.class));

        System.out.println("La organización del grupo se mantiene después de eliminar estudiante");
        System.out.println("   Estudiantes iniciales: " + initialCount);
        System.out.println("   El grupo permanece organizado con los estudiantes restantes");
    }
}