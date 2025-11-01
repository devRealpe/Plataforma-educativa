package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.Exercise;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.entities.Role;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.ExerciseRepository;
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
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 9 (HU9)
 * Descarga de Ejercicios Asignados
 * 
 * Descripción: Como estudiante, quiero descargar ejercicios asignados
 * para poder trabajar en ellos de manera offline
 * 
 * Criterio de Aceptación:
 * CID 1: Cuando el estudiante hace clic en el botón "Descargar" de un ejercicio
 * → El sistema descarga el archivo en formato correspondiente (PDF, ZIP, etc.)
 * → Muestra un mensaje de confirmación de descarga exitosa
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU9: Descarga de Ejercicios Asignados")
class ExerciseServiceTest_HU9 {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExerciseService exerciseService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;
    private Exercise testExercise;

    @BeforeEach
    void setUp() {
        // Profesor del curso
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        // Estudiante inscrito en el curso
        testStudent = new User();
        testStudent.setId(2L);
        testStudent.setEmail("student@test.com");
        testStudent.setNombre("Estudiante Test");
        testStudent.setRole(Role.STUDENT);

        // Curso de prueba
        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Matemáticas I");
        testCourse.setDescription("Curso básico de álgebra");
        testCourse.setLevel("Básico");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent);

        // Ejercicio con archivo adjunto
        testExercise = new Exercise();
        testExercise.setId(1L);
        testExercise.setTitle("Ejercicio de Álgebra");
        testExercise.setDescription("Resolver ecuaciones cuadráticas");
        testExercise.setDifficulty("BASICO");
        testExercise.setCourse(testCourse);
    }

    // ========================================
    // CASO DE PRUEBA PRINCIPAL - HU9
    // ========================================

    /**
     * CP009 - Escenario 01 (CID 1)
     * Descarga exitosa de ejercicio asignado
     * 
     * Dado: Un estudiante inscrito en un curso con ejercicios asignados
     * Cuando: Hace clic en el botón "Descargar" de un ejercicio con archivo adjunto
     * Entonces: El sistema descarga el archivo en formato correspondiente (PDF)
     * Y: Confirma la descarga exitosa
     * 
     * Datos de entrada:
     * - exerciseId: 1L
     * - studentEmail: "student@test.com"
     * 
     * Resultado esperado:
     * - Verdadero: El sistema descarga el archivo del ejercicio en formato
     * correspondiente y confirma con mensaje de éxito
     */
    @Test
    @DisplayName("CP009 - HU9: Descarga exitosa de ejercicio con archivo adjunto")
    void testCP009_DescargaExitosaDeEjercicio() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP009: Descarga exitosa de ejercicio ===");

        // Preparar archivo de ejercicio (PDF de ejemplo)
        byte[] fileContent = "%PDF-1.4 contenido del ejercicio...".getBytes();
        testExercise.setFileData(fileContent);
        testExercise.setFileName("ejercicio_algebra.pdf");
        testExercise.setFileType("application/pdf");

        // Configurar mocks
        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        // ==================== ACT ====================
        byte[] result = exerciseService.getExerciseFile(1L, "student@test.com");

        // ==================== ASSERT ====================
        // Verificar que el archivo se descargó correctamente
        assertNotNull(result, "El contenido del archivo no debe ser nulo");
        assertArrayEquals(fileContent, result, "El contenido descargado debe coincidir con el archivo original");
        assertTrue(result.length > 0, "El archivo debe tener contenido");
        assertEquals(fileContent.length, result.length, "El tamaño del archivo debe coincidir");

        // Verificar que se realizaron las consultas correctas
        verify(exerciseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("student@test.com");

        // ==================== RESULTADO ====================
        System.out.println("CP009 PASÓ: Ejercicio descargado exitosamente");
        System.out.println("   Ejercicio: " + testExercise.getTitle());
        System.out.println("   Archivo: " + testExercise.getFileName());
        System.out.println("   Tipo: " + testExercise.getFileType());
        System.out.println("   Tamaño: " + result.length + " bytes");
        System.out.println("   Estudiante: " + testStudent.getNombre());
        System.out.println("   Mensaje esperado en frontend: 'Descarga exitosa'");
        System.out.println("");
        System.out.println("✅ VALIDACIÓN EXITOSA:");
        System.out.println("   - El sistema recuperó correctamente el ejercicio");
        System.out.println("   - El estudiante tiene acceso al curso");
        System.out.println("   - El archivo se descargó en formato " + testExercise.getFileType());
        System.out.println("   - El contenido del archivo es íntegro y completo");
    }

    // ========================================
    // PRUEBAS ADICIONALES DE VALIDACIÓN
    // ========================================

    /**
     * Prueba adicional: Validar que solo estudiantes inscritos pueden descargar
     */
    @Test
    @DisplayName("HU9: Solo estudiantes inscritos pueden descargar ejercicios")
    void testDescarga_SoloEstudiantesInscritos() {
        System.out.println("\n=== Validación: Solo estudiantes inscritos pueden descargar ===");

        // Estudiante NO inscrito en el curso
        User otherStudent = new User();
        otherStudent.setId(99L);
        otherStudent.setEmail("other@test.com");
        otherStudent.setRole(Role.STUDENT);

        byte[] fileContent = "contenido del ejercicio".getBytes();
        testExercise.setFileData(fileContent);
        testExercise.setFileName("ejercicio.pdf");
        testExercise.setFileType("application/pdf");

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> exerciseService.getExerciseFile(1L, "other@test.com"),
                "Debe lanzar excepción para estudiante no inscrito");

        assertEquals("No tienes acceso a este ejercicio", exception.getMessage());

        System.out.println("✅ Sistema valida que solo estudiantes inscritos pueden descargar");
        System.out.println("   Mensaje de error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Error cuando el ejercicio no tiene archivo
     */
    @Test
    @DisplayName("HU9: Error al intentar descargar ejercicio sin archivo adjunto")
    void testDescarga_EjercicioSinArchivo() {
        System.out.println("\n=== Validación: Ejercicio sin archivo adjunto ===");

        // Ejercicio sin archivo
        testExercise.setFileData(null);
        testExercise.setFileName(null);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> exerciseService.getExerciseFile(1L, "student@test.com"),
                "Debe lanzar excepción cuando no hay archivo");

        assertEquals("Este ejercicio no tiene archivo adjunto", exception.getMessage());

        System.out.println("✅ Sistema valida que el ejercicio tenga archivo antes de descargar");
        System.out.println("   Mensaje de error: " + exception.getMessage());
        System.out.println("   Nota: El botón 'Descargar' debe estar oculto en frontend si no hay archivo");
    }

    /**
     * Prueba adicional: Ejercicio no encontrado
     */
    @Test
    @DisplayName("HU9: Error cuando el ejercicio no existe")
    void testDescarga_EjercicioNoExiste() {
        System.out.println("\n=== Validación: Ejercicio no encontrado ===");

        when(exerciseRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> exerciseService.getExerciseFile(999L, "student@test.com"),
                "Debe lanzar excepción cuando el ejercicio no existe");

        assertEquals("Ejercicio no encontrado", exception.getMessage());

        System.out.println("✅ Sistema maneja correctamente ejercicio no encontrado");
        System.out.println("   Mensaje de error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: El profesor también puede descargar ejercicios
     */
    @Test
    @DisplayName("HU9: El profesor del curso puede descargar ejercicios")
    void testDescarga_ProfesorPuedeDescargar() {
        System.out.println("\n=== Validación: Profesor puede descargar sus propios ejercicios ===");

        byte[] fileContent = "contenido del ejercicio del profesor".getBytes();
        testExercise.setFileData(fileContent);
        testExercise.setFileName("ejercicio_profesor.pdf");
        testExercise.setFileType("application/pdf");

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        // Act
        byte[] result = exerciseService.getExerciseFile(1L, "teacher@test.com");

        // Assert
        assertNotNull(result);
        assertArrayEquals(fileContent, result);

        System.out.println("✅ El profesor puede descargar sus propios ejercicios");
        System.out.println("   Archivo descargado: " + testExercise.getFileName());
    }
}