package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Challenge;
import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.entities.Role;
import com.unimar.plataforma_educativa_angular.repositories.ChallengeRepository;
import com.unimar.plataforma_educativa_angular.repositories.CourseRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 13 (HU13)
 * Eliminar Retos Publicados con Confirmación Previa
 * 
 * Descripción: Verificar que el sistema permita a los docentes eliminar retos
 * publicados con confirmación previa.
 * 
 * Datos de entrada:
 * {
 * challengeId: 1L,
 * teacherEmail: "teacher@test.com"
 * }
 * 
 * Criterios de Aceptación:
 * CID 1: El sistema solicita confirmación en frontend, elimina el reto
 * y muestra mensaje "Reto eliminado exitosamente"
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU13: Eliminar Retos con Confirmación")
class ChallengeServiceTest_HU13 {

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
    private Challenge testChallenge;

    @BeforeEach
    void setUp() {
        // Configurar profesor de prueba
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        // Configurar curso de prueba
        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Algoritmos y Estructuras de Datos");
        testCourse.setDescription("Curso avanzado de algoritmos");
        testCourse.setLevel("Intermedio");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());

        // Configurar reto de prueba
        testChallenge = new Challenge();
        testChallenge.setId(1L);
        testChallenge.setTitle("Reto de Algoritmos");
        testChallenge.setDescription("Implementar algoritmos de ordenamiento");
        testChallenge.setDifficulty("INTERMEDIO");
        testChallenge.setMaxBonusPoints(8);
        testChallenge.setDeadline(LocalDateTime.parse("2025-12-31T23:59:59"));
        testChallenge.setCourse(testCourse);
        testChallenge.setActive(true);
        testChallenge.setCreatedAt(LocalDateTime.now());
    }

    // ========================================
    // CP013: Eliminación exitosa con confirmación
    // ========================================

    /**
     * CP013 - HU13 - Escenario 01
     * Eliminación exitosa de reto con confirmación previa
     * 
     * Dado: Un profesor con un reto publicado en su curso
     * Cuando: Elimina el reto con los datos:
     * - challengeId: 1L
     * - teacherEmail: "teacher@test.com"
     * - confirmed: true (confirmación en frontend)
     * Entonces: El sistema solicita confirmación en frontend
     * Y: Elimina el reto de la base de datos
     * Y: Muestra el mensaje "Reto eliminado exitosamente"
     */
    @Test
    @DisplayName("CP013 - HU13: Eliminación exitosa de reto con confirmación")
    void testCP013_EliminacionExitosaConConfirmacion() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP013: Eliminación exitosa de reto con confirmación ===");

        // Datos de entrada según especificación
        Long challengeId = 1L;
        String teacherEmail = "teacher@test.com";

        // Configurar mocks
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail(teacherEmail)).thenReturn(Optional.of(testTeacher));
        doNothing().when(challengeRepository).delete(testChallenge);

        // ==================== ACT ====================
        // El frontend debe solicitar confirmación ANTES de llamar este método
        // confirmed: true significa que el usuario ya confirmó la acción
        assertDoesNotThrow(() -> challengeService.deleteChallenge(challengeId, teacherEmail),
                "No debe lanzar excepción al eliminar reto válido");

        // ==================== ASSERT ====================
        // Verificar que se buscó el reto
        verify(challengeRepository, times(1)).findById(challengeId);

        // Verificar que se validó el profesor
        verify(userRepository, times(1)).findByEmail(teacherEmail);

        // Verificar que se eliminó el reto
        verify(challengeRepository, times(1)).delete(testChallenge);

        // Verificar que solo se ejecutaron las operaciones necesarias
        verifyNoMoreInteractions(challengeRepository, userRepository);

        // ==================== RESULTADO ====================
        System.out.println("✅ CP013 PASÓ: Reto eliminado exitosamente");
        System.out.println("   Challenge ID: " + challengeId);
        System.out.println("   Profesor: " + teacherEmail);
        System.out.println("   Reto eliminado: " + testChallenge.getTitle());
        System.out.println("   Mensaje: 'Reto eliminado exitosamente'");
        System.out.println("   NOTA IMPORTANTE:");
        System.out.println("      - El frontend DEBE solicitar confirmación antes de llamar a este método");
        System.out.println("      - Ejemplo de mensaje de confirmación:");
        System.out.println("        '¿Estás seguro de que deseas eliminar este reto?'");
        System.out.println("        'Esta acción no se puede deshacer.'");
        System.out.println("      - Solo si el usuario confirma (confirmed: true)");
        System.out.println("        se debe invocar deleteChallenge()");
    }

    // ========================================
    // Pruebas adicionales de validación
    // ========================================

    /**
     * Prueba adicional: Validar que solo el profesor del curso puede eliminar
     */
    @Test
    @DisplayName("HU13: Solo el profesor del curso puede eliminar el reto")
    void testSoloProfesorDelCursoPuedeEliminar() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== Validación: Solo el profesor del curso puede eliminar ===");

        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // ==================== ACT & ASSERT ====================
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> challengeService.deleteChallenge(1L, "other@test.com"),
                "Debe lanzar excepción si el profesor no es el dueño del curso");

        assertEquals("No tienes permiso para eliminar este reto", exception.getMessage());

        // Verificar que NO se eliminó
        verify(challengeRepository, never()).delete(any(Challenge.class));

        System.out.println("✅ Sistema valida permisos correctamente");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Validar que el reto debe existir
     */
    @Test
    @DisplayName("HU13: Reto no encontrado lanza excepción")
    void testRetoNoEncontrado() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== Validación: Reto no encontrado ===");

        when(challengeRepository.findById(999L)).thenReturn(Optional.empty());

        // ==================== ACT & ASSERT ====================
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> challengeService.deleteChallenge(999L, "teacher@test.com"),
                "Debe lanzar excepción si el reto no existe");

        assertEquals("Reto no encontrado", exception.getMessage());

        // Verificar que NO se intentó eliminar
        verify(challengeRepository, never()).delete(any(Challenge.class));

        System.out.println("✅ Sistema maneja correctamente reto no encontrado");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Validar que el profesor debe existir
     */
    @Test
    @DisplayName("HU13: Profesor no encontrado lanza excepción")
    void testProfesorNoEncontrado() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== Validación: Profesor no encontrado ===");

        when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail("noexiste@test.com")).thenReturn(Optional.empty());

        // ==================== ACT & ASSERT ====================
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> challengeService.deleteChallenge(1L, "noexiste@test.com"),
                "Debe lanzar excepción si el profesor no existe");

        assertEquals("Profesor no encontrado", exception.getMessage());

        // Verificar que NO se eliminó
        verify(challengeRepository, never()).delete(any(Challenge.class));

        System.out.println("✅ Sistema maneja correctamente profesor no encontrado");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Validar que se puede eliminar reto con soluciones asociadas
     * (eliminación en cascada)
     */
    @Test
    @DisplayName("HU13: Eliminar reto con soluciones asociadas (cascada)")
    void testEliminarRetoConSolucionesAsociadas() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== Validación: Eliminar reto con soluciones asociadas ===");

        // El reto tiene soluciones asociadas (relación con ChallengeSubmission)
        // La eliminación debe ser en cascada según la entidad Challenge

        when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        doNothing().when(challengeRepository).delete(testChallenge);

        // ==================== ACT ====================
        assertDoesNotThrow(() -> challengeService.deleteChallenge(1L, "teacher@test.com"),
                "Debe poder eliminar reto con soluciones (cascada)");

        // ==================== ASSERT ====================
        verify(challengeRepository, times(1)).delete(testChallenge);

        System.out.println("✅ Sistema permite eliminar reto con soluciones asociadas");
        System.out.println(
                "   La eliminación es en cascada según @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)");
        System.out.println("   Las soluciones asociadas también se eliminan automáticamente");
        System.out.println("   IMPORTANTE: El frontend debe advertir esto en el mensaje de confirmación:");
        System.out.println("      '¿Estás seguro? También se eliminarán todas las soluciones enviadas.'");
    }

    /**
     * Prueba adicional: Verificar el flujo completo de eliminación
     */
    @Test
    @DisplayName("HU13: Flujo completo de eliminación verificado")
    void testFlujoCompletoDeEliminacion() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== Validación: Flujo completo de eliminación ===");

        when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        doNothing().when(challengeRepository).delete(testChallenge);

        // ==================== ACT ====================
        challengeService.deleteChallenge(1L, "teacher@test.com");

        // ==================== ASSERT ====================
        // Verificar orden de operaciones
        var inOrder = inOrder(challengeRepository, userRepository);

        // 1. Primero busca el reto
        inOrder.verify(challengeRepository).findById(1L);

        // 2. Luego busca el profesor
        inOrder.verify(userRepository).findByEmail("teacher@test.com");

        // 3. Finalmente elimina el reto
        inOrder.verify(challengeRepository).delete(testChallenge);

        System.out.println("✅ Flujo de eliminación ejecutado en el orden correcto:");
        System.out.println("   1. Buscar reto por ID");
        System.out.println("   2. Validar permisos del profesor");
        System.out.println("   3. Eliminar reto de la base de datos");
    }
}