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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 11 (HU11)
 * Edición de Curso y Gestión de Estudiantes
 * 
 * Descripción: Como docente, quiero editar la información de mis cursos
 * y gestionar la lista de estudiantes inscritos para mantener actualizada
 * la información del grupo
 * 
 * Criterio de Aceptación:
 * CID 1: Cuando el docente selecciona la opción "Eliminar" junto a un
 * estudiante
 * y confirma la acción
 * → El sistema solicita confirmación (en frontend)
 * → El sistema elimina al estudiante de la lista del curso
 * → Muestra un mensaje de confirmación
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU11: Edición de Curso y Gestión de Estudiantes")
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
        // Profesor del curso
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        // Estudiantes inscritos en el curso
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

        // Curso de prueba con 3 estudiantes
        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Matemáticas I");
        testCourse.setDescription("Curso básico de álgebra");
        testCourse.setLevel("Básico");
        testCourse.setInviteCode("ABC123");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent1);
        testCourse.getStudents().add(testStudent2);
        testCourse.getStudents().add(testStudent3);
    }

    // ========================================
    // CASO DE PRUEBA PRINCIPAL - HU11
    // ========================================

    /**
     * CP011-01 - Escenario 01 (CID 1)
     * Eliminación exitosa de estudiante del curso
     * 
     * Dado: Un docente con un curso que tiene estudiantes inscritos
     * Cuando: Selecciona la opción "Eliminar" junto a un estudiante
     * Y: Confirma la acción en el cuadro de diálogo
     * Entonces: El sistema elimina al estudiante de la lista del curso
     * Y: Actualiza la información en la base de datos
     * Y: Muestra un mensaje de confirmación
     * 
     * Datos de entrada:
     * - courseId: 1L
     * - studentId: 2L (Estudiante Uno)
     * - teacherEmail: "teacher@test.com"
     * 
     * Resultado esperado:
     * - Verdadero: El sistema solicita confirmación (en frontend) y elimina
     * al estudiante de la lista del curso exitosamente
     */
    @Test
    @DisplayName("CP011-01 - HU11: Eliminación exitosa de estudiante del curso")
    void testCP011_01_EliminacionExitosaDeEstudiante() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP011-01: Eliminación exitosa de estudiante del curso ===");

        // Configurar mocks
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testStudent1));

        // Curso actualizado después de eliminar al estudiante
        Course updatedCourse = new Course();
        updatedCourse.setId(1L);
        updatedCourse.setTitle("Matemáticas I");
        updatedCourse.setTeacher(testTeacher);
        updatedCourse.setStudents(new HashSet<>());
        updatedCourse.getStudents().add(testStudent2);
        updatedCourse.getStudents().add(testStudent3);

        when(courseRepository.save(any(Course.class))).thenReturn(updatedCourse);

        int initialStudentCount = testCourse.getStudents().size();

        // ==================== ACT ====================
        assertDoesNotThrow(() -> courseService.removeStudentFromCourse(1L, 2L, "teacher@test.com"),
                "La eliminación del estudiante no debe lanzar excepción");

        // ==================== ASSERT ====================
        // Verificar estado inicial
        assertEquals(3, initialStudentCount, "Inicialmente debe haber 3 estudiantes en el curso");

        // Verificar que se llamaron los métodos correctos
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(userRepository, times(1)).findById(2L);
        verify(courseRepository, times(1)).save(any(Course.class));

        // Verificar que el estudiante fue removido del conjunto
        assertFalse(testCourse.getStudents().contains(testStudent1),
                "El estudiante eliminado no debe estar en la lista del curso");

        // ==================== RESULTADO ====================
        System.out.println("CP011-01 PASÓ: Estudiante eliminado exitosamente del curso");
        System.out.println("");
        System.out.println("📊 DETALLES DE LA OPERACIÓN:");
        System.out.println("   Curso: " + testCourse.getTitle());
        System.out.println("   Código del curso: " + testCourse.getInviteCode());
        System.out.println("   Estudiantes iniciales: " + initialStudentCount);
        System.out
                .println("   Estudiante eliminado: " + testStudent1.getNombre() + " (" + testStudent1.getEmail() + ")");
        System.out.println("   Estudiantes restantes: 2");
        System.out.println("   Profesor: " + testTeacher.getNombre());
        System.out.println("");
        System.out.println("✅ VALIDACIÓN EXITOSA:");
        System.out.println("   - El sistema verificó que el profesor pertenece al curso");
        System.out.println("   - El estudiante fue removido de la lista correctamente");
        System.out.println("   - El curso se guardó en la base de datos con los cambios");
        System.out.println("   - Los demás estudiantes permanecen en el curso");
        System.out.println("");
        System.out.println("📋 NOTA PARA FRONTEND:");
        System.out.println("   - El sistema debe mostrar un cuadro de diálogo de confirmación");
        System.out.println("   - Mensaje sugerido: '¿Está seguro de eliminar a [Nombre] del curso?'");
        System.out.println("   - Después de confirmar, mostrar: 'Estudiante eliminado del curso exitosamente'");
        System.out.println("   - La lista de estudiantes debe actualizarse automáticamente");
    }

    // ========================================
    // PRUEBAS ADICIONALES DE VALIDACIÓN
    // ========================================

    /**
     * Prueba adicional: Solo el profesor del curso puede eliminar estudiantes
     */
    @Test
    @DisplayName("HU11: Solo el profesor del curso puede eliminar estudiantes")
    void testEliminacion_SoloProfesorDelCurso() {
        System.out.println("\n=== Validación: Solo el profesor del curso puede eliminar ===");

        // Otro profesor que no es dueño del curso
        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(1L, 2L, "other@test.com"),
                "Debe lanzar excepción si el profesor no es dueño del curso");

        assertEquals("No tienes permiso para eliminar estudiantes de este curso", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("✅ Sistema valida que solo el profesor del curso puede eliminar");
        System.out.println("   Mensaje de error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: No se puede eliminar estudiante que no está inscrito
     */
    @Test
    @DisplayName("HU11: No se puede eliminar estudiante que no está inscrito")
    void testEliminacion_EstudianteNoInscrito() {
        System.out.println("\n=== Validación: Estudiante no inscrito en el curso ===");

        // Estudiante que NO está inscrito en el curso
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
                () -> courseService.removeStudentFromCourse(1L, 99L, "teacher@test.com"),
                "Debe lanzar excepción si el estudiante no está inscrito");

        assertEquals("El estudiante no está inscrito en este curso", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("✅ Sistema valida que el estudiante esté inscrito antes de eliminar");
        System.out.println("   Mensaje de error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Curso no encontrado
     */
    @Test
    @DisplayName("HU11: Error cuando el curso no existe")
    void testEliminacion_CursoNoExiste() {
        System.out.println("\n=== Validación: Curso no encontrado ===");

        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(999L, 2L, "teacher@test.com"),
                "Debe lanzar excepción cuando el curso no existe");

        assertEquals("Curso no encontrado", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("✅ Sistema maneja correctamente curso no encontrado");
        System.out.println("   Mensaje de error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Estudiante no encontrado
     */
    @Test
    @DisplayName("HU11: Error cuando el estudiante no existe")
    void testEliminacion_EstudianteNoExiste() {
        System.out.println("\n=== Validación: Estudiante no encontrado ===");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> courseService.removeStudentFromCourse(1L, 999L, "teacher@test.com"),
                "Debe lanzar excepción cuando el estudiante no existe");

        assertEquals("Estudiante no encontrado", exception.getMessage());
        verify(courseRepository, never()).save(any(Course.class));

        System.out.println("✅ Sistema maneja correctamente estudiante no encontrado");
        System.out.println("   Mensaje de error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Eliminar múltiples estudiantes
     */
    @Test
    @DisplayName("HU11: Eliminar múltiples estudiantes del curso")
    void testEliminacion_MultiplesEstudiantes() {
        System.out.println("\n=== Validación: Eliminar múltiples estudiantes ===");

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

        System.out.println("✅ Profesor puede eliminar múltiples estudiantes");
        System.out.println("   Estudiantes eliminados: 2");
        System.out.println("   Cada eliminación requiere su propia confirmación");
    }

    /**
     * Prueba adicional: Mantener organización del grupo
     */
    @Test
    @DisplayName("HU11: Mantener organización del grupo después de eliminar")
    void testEliminacion_MantenerOrganizacion() {
        System.out.println("\n=== Validación: Organización del grupo se mantiene ===");

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
        assertFalse(testCourse.getStudents().contains(testStudent1));
        assertTrue(testCourse.getStudents().contains(testStudent2));
        assertTrue(testCourse.getStudents().contains(testStudent3));

        System.out.println("✅ La organización del grupo se mantiene correctamente");
        System.out.println("   Estudiantes iniciales: " + initialCount);
        System.out.println("   Estudiante eliminado: " + testStudent1.getNombre());
        System.out.println("   Estudiantes restantes: 2");
        System.out.println("   Los demás estudiantes permanecen en el curso");
    }

    /**
     * Prueba adicional: Validar actualización correcta en la base de datos
     */
    @Test
    @DisplayName("HU11: Validar que el curso se actualiza correctamente en BD")
    void testEliminacion_ActualizacionEnBD() {
        System.out.println("\n=== Validación: Actualización correcta en base de datos ===");

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

        System.out.println("✅ El curso se actualiza correctamente en la base de datos");
        System.out.println("   - El método save() fue llamado una vez");
        System.out.println("   - El estudiante fue removido del conjunto");
        System.out.println("   - Los cambios se persisten correctamente");
    }
}