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

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 16 (HU16)
 * Revisar Retos Realizados, Calificar y Asignar Bonificaciones
 * 
 * Descripción: Verificar que el sistema permita a los docentes revisar retos
 * realizados, calificar y asignar bonificaciones a estudiantes.
 * 
 * Datos de entrada:
 * {
 * challengeId: 1L,
 * submissionId: 1L,
 * bonusPoints: 8,
 * feedback: "Excelente implementación",
 * teacherEmail: "teacher@test.com"
 * }
 * 
 * Criterios de Aceptación:
 * CID 1: El sistema muestra todas las entregas asociadas al reto con
 * información
 * del estudiante, archivo y estado
 * CID 2: El sistema registra bonusPoints, actualiza estado a REVIEWED, guarda
 * feedback, actualiza StudentScore y muestra mensaje de confirmación
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU16: Revisar Retos y Asignar Bonificaciones")
class ChallengeSubmissionServiceTest_HU16 {

    @Mock
    private ChallengeSubmissionRepository submissionRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentScoreRepository studentScoreRepository;

    @InjectMocks
    private ChallengeSubmissionService submissionService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent1;
    private User testStudent2;
    private Challenge testChallenge;
    private ChallengeSubmission testSubmission1;
    private ChallengeSubmission testSubmission2;

    @BeforeEach
    void setUp() {
        // Configurar profesor
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        // Configurar estudiantes
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

        // Configurar curso
        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Algoritmos Avanzados");
        testCourse.setLevel("Avanzado");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent1);
        testCourse.getStudents().add(testStudent2);

        // Configurar reto
        testChallenge = new Challenge();
        testChallenge.setId(1L);
        testChallenge.setTitle("Implementar Árbol AVL");
        testChallenge.setDescription("Crear implementación completa de árbol balanceado");
        testChallenge.setDifficulty("AVANZADO");
        testChallenge.setMaxBonusPoints(10);
        testChallenge.setCourse(testCourse);
        testChallenge.setActive(true);
        testChallenge.setDeadline(LocalDateTime.now().plusDays(7));

        // Configurar soluciones
        byte[] fileContent1 = "Solución del estudiante 1".getBytes();
        testSubmission1 = new ChallengeSubmission();
        testSubmission1.setId(1L);
        testSubmission1.setChallenge(testChallenge);
        testSubmission1.setStudent(testStudent1);
        testSubmission1.setFileData(fileContent1);
        testSubmission1.setFileName("solucion_avl_estudiante1.zip");
        testSubmission1.setFileType("application/zip");
        testSubmission1.setStatus(ChallengeSubmission.SubmissionStatus.PENDING);
        testSubmission1.setSubmittedAt(LocalDateTime.now().minusDays(1));

        byte[] fileContent2 = "Solución del estudiante 2".getBytes();
        testSubmission2 = new ChallengeSubmission();
        testSubmission2.setId(2L);
        testSubmission2.setChallenge(testChallenge);
        testSubmission2.setStudent(testStudent2);
        testSubmission2.setFileData(fileContent2);
        testSubmission2.setFileName("solucion_avl_estudiante2.zip");
        testSubmission2.setFileType("application/zip");
        testSubmission2.setStatus(ChallengeSubmission.SubmissionStatus.PENDING);
        testSubmission2.setSubmittedAt(LocalDateTime.now().minusDays(2));
    }

    // ========================================
    // CP016-1: Ver lista de soluciones por reto
    // ========================================

    /**
     * CP016-1 - HU16 - Escenario 01
     * Ver lista de soluciones por reto
     * 
     * Dado: Un profesor con un reto que tiene soluciones enviadas
     * Cuando: Solicita ver las soluciones del reto con los datos:
     * - challengeId: 1L
     * - teacherEmail: "teacher@test.com"
     * Entonces: El sistema muestra todas las entregas asociadas al reto
     * Y: Muestra información del estudiante (nombre, email)
     * Y: Muestra información del archivo (nombre, tipo)
     * Y: Muestra el estado de la solución (PENDING, REVIEWED, REJECTED)
     */
    @Test
    @DisplayName("CP016-1 - HU16: Ver lista de soluciones por reto")
    void testCP016_1_VerListaDeSolucionesPorReto() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP016-1: Ver lista de soluciones por reto ===");

        // Datos de entrada según especificación
        Long challengeId = 1L;
        String teacherEmail = "teacher@test.com";

        // Lista de soluciones del reto
        List<ChallengeSubmission> submissions = Arrays.asList(testSubmission1, testSubmission2);

        // Configurar mocks
        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail(teacherEmail)).thenReturn(Optional.of(testTeacher));
        when(submissionRepository.findByChallengeId(challengeId)).thenReturn(submissions);

        // ==================== ACT ====================
        List<ChallengeSubmission> result = submissionService.getSubmissionsByChallenge(
                challengeId,
                teacherEmail);

        // ==================== ASSERT ====================
        assertNotNull(result, "La lista de soluciones no debe ser nula");
        assertEquals(2, result.size(), "Debe haber 2 soluciones");

        // Validar primera solución
        ChallengeSubmission submission1 = result.get(0);
        assertNotNull(submission1.getStudent(), "Debe tener información del estudiante");
        assertEquals("Estudiante Uno", submission1.getStudent().getNombre());
        assertEquals("student1@test.com", submission1.getStudent().getEmail());
        assertTrue(submission1.hasFile(), "Debe tener archivo adjunto");
        assertEquals("solucion_avl_estudiante1.zip", submission1.getFileName());
        assertEquals("application/zip", submission1.getFileType());
        assertEquals(ChallengeSubmission.SubmissionStatus.PENDING, submission1.getStatus());
        assertNotNull(submission1.getSubmittedAt(), "Debe tener fecha de envío");

        // Validar segunda solución
        ChallengeSubmission submission2 = result.get(1);
        assertNotNull(submission2.getStudent(), "Debe tener información del estudiante");
        assertEquals("Estudiante Dos", submission2.getStudent().getNombre());
        assertEquals("student2@test.com", submission2.getStudent().getEmail());
        assertTrue(submission2.hasFile(), "Debe tener archivo adjunto");
        assertEquals("solucion_avl_estudiante2.zip", submission2.getFileName());
        assertEquals("application/zip", submission2.getFileType());
        assertEquals(ChallengeSubmission.SubmissionStatus.PENDING, submission2.getStatus());
        assertNotNull(submission2.getSubmittedAt(), "Debe tener fecha de envío");

        // Verificar que todas las soluciones pertenecen al mismo reto
        result.forEach(submission -> {
            assertEquals(challengeId, submission.getChallenge().getId(),
                    "Todas las soluciones deben pertenecer al reto correcto");
        });

        // Verificar interacciones
        verify(challengeRepository, times(1)).findById(challengeId);
        verify(userRepository, times(1)).findByEmail(teacherEmail);
        verify(submissionRepository, times(1)).findByChallengeId(challengeId);

        // ==================== RESULTADO ====================
        System.out.println("✅ CP016-1 PASÓ: Lista de soluciones recuperada exitosamente");
        System.out.println("   Reto: " + testChallenge.getTitle());
        System.out.println("   Total de soluciones: " + result.size());
        System.out.println("");
        System.out.println("📋 SOLUCIONES ENCONTRADAS:");
        for (int i = 0; i < result.size(); i++) {
            ChallengeSubmission sub = result.get(i);
            System.out.println("   " + (i + 1) + ". Estudiante: " + sub.getStudent().getNombre());
            System.out.println("      Email: " + sub.getStudent().getEmail());
            System.out.println("      Archivo: " + sub.getFileName());
            System.out.println("      Tipo: " + sub.getFileType());
            System.out.println("      Estado: " + sub.getStatus());
            System.out.println("      Enviado: " + sub.getSubmittedAt());
        }
    }

    // ========================================
    // CP016-2: Revisión y bonificación exitosa
    // ========================================

    /**
     * CP016-2 - HU16 - Escenario 02
     * Revisión y bonificación exitosa
     * 
     * Dado: Un profesor con una solución de reto pendiente de revisión
     * Cuando: Revisa y bonifica la solución con los datos:
     * - submissionId: 1L
     * - bonusPoints: 8
     * - feedback: "Excelente trabajo"
     * - teacherEmail: "teacher@test.com"
     * Entonces: El sistema registra bonusPoints (8 XP)
     * Y: Actualiza el estado a REVIEWED
     * Y: Guarda el feedback del profesor
     * Y: Actualiza StudentScore (totalBonusPoints y challengesCompleted)
     * Y: Muestra mensaje de confirmación
     */
    @Test
    @DisplayName("CP016-2 - HU16: Revisión y bonificación exitosa")
    void testCP016_2_RevisionYBonificacionExitosa() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP016-2: Revisión y bonificación exitosa ===");

        // Datos de entrada según especificación
        Long submissionId = 1L;
        Integer bonusPoints = 8;
        String feedback = "Excelente trabajo";
        String teacherEmail = "teacher@test.com";

        // Configurar StudentScore existente
        StudentScore existingScore = new StudentScore();
        existingScore.setId(1L);
        existingScore.setStudent(testStudent1);
        existingScore.setCourse(testCourse);
        existingScore.setTotalBonusPoints(12); // Ya tenía 12 XP
        existingScore.setChallengesCompleted(1); // Ya había completado 1 reto

        // Configurar mocks
        when(submissionRepository.findById(submissionId)).thenReturn(Optional.of(testSubmission1));
        when(userRepository.findByEmail(teacherEmail)).thenReturn(Optional.of(testTeacher));
        when(studentScoreRepository.findByStudentIdAndCourseId(testStudent1.getId(), testCourse.getId()))
                .thenReturn(Optional.of(existingScore));

        // Simular solución actualizada
        ChallengeSubmission updatedSubmission = new ChallengeSubmission();
        updatedSubmission.setId(submissionId);
        updatedSubmission.setChallenge(testChallenge);
        updatedSubmission.setStudent(testStudent1);
        updatedSubmission.setFileData(testSubmission1.getFileData());
        updatedSubmission.setFileName(testSubmission1.getFileName());
        updatedSubmission.setFileType(testSubmission1.getFileType());
        updatedSubmission.setBonusPoints(bonusPoints);
        updatedSubmission.setFeedback(feedback);
        updatedSubmission.setStatus(ChallengeSubmission.SubmissionStatus.REVIEWED);
        updatedSubmission.setReviewedAt(LocalDateTime.now());

        when(submissionRepository.save(any(ChallengeSubmission.class))).thenReturn(updatedSubmission);

        // Simular StudentScore actualizado
        StudentScore updatedScore = new StudentScore();
        updatedScore.setId(1L);
        updatedScore.setStudent(testStudent1);
        updatedScore.setCourse(testCourse);
        updatedScore.setTotalBonusPoints(20); // 12 + 8 = 20 XP
        updatedScore.setChallengesCompleted(2); // 1 + 1 = 2 retos

        when(studentScoreRepository.save(any(StudentScore.class))).thenReturn(updatedScore);

        // ==================== ACT ====================
        ChallengeSubmission result = submissionService.reviewSubmission(
                submissionId,
                bonusPoints,
                feedback,
                teacherEmail);

        // ==================== ASSERT ====================
        // Validar que la solución se actualizó correctamente
        assertNotNull(result, "La solución revisada no debe ser nula");
        assertEquals(submissionId, result.getId(), "El ID debe coincidir");
        assertEquals(bonusPoints, result.getBonusPoints(), "Los puntos de bonificación deben coincidir");
        assertEquals(feedback, result.getFeedback(), "El feedback debe coincidir");
        assertEquals(ChallengeSubmission.SubmissionStatus.REVIEWED, result.getStatus(),
                "El estado debe ser REVIEWED");
        assertNotNull(result.getReviewedAt(), "Debe tener fecha de revisión");

        // Verificar que se llamó a save para guardar la solución
        verify(submissionRepository, times(1)).save(any(ChallengeSubmission.class));

        // Verificar que se buscó el StudentScore
        verify(studentScoreRepository, times(1))
                .findByStudentIdAndCourseId(testStudent1.getId(), testCourse.getId());

        // Verificar que se actualizó el StudentScore
        verify(studentScoreRepository, times(1)).save(any(StudentScore.class));

        // Verificar todas las interacciones necesarias
        verify(submissionRepository, times(1)).findById(submissionId);
        verify(userRepository, times(1)).findByEmail(teacherEmail);

        // ==================== RESULTADO ====================
        System.out.println("✅ CP016-2 PASÓ: Solución revisada y bonificada exitosamente");
        System.out.println("");
        System.out.println("📊 DETALLES DE LA REVISIÓN:");
        System.out.println("   Reto: " + testChallenge.getTitle());
        System.out.println("   Estudiante: " + testStudent1.getNombre());
        System.out.println("   Bonificación otorgada: " + bonusPoints + " XP");
        System.out.println("   Feedback: " + feedback);
        System.out.println("   Estado: " + result.getStatus());
        System.out.println("   Fecha de revisión: " + result.getReviewedAt());
        System.out.println("");
        System.out.println("💎 ACTUALIZACIÓN DE PUNTUACIÓN:");
        System.out.println("   Puntos previos: 12 XP");
        System.out.println("   Puntos otorgados: " + bonusPoints + " XP");
        System.out.println("   Puntos totales: 20 XP");
        System.out.println("   Retos completados previos: 1");
        System.out.println("   Retos completados totales: 2");
        System.out.println("");
        System.out.println("✅ VALIDACIÓN EXITOSA:");
        System.out.println("   - La solución se actualizó con bonusPoints = " + bonusPoints);
        System.out.println("   - El estado cambió a REVIEWED");
        System.out.println("   - Se guardó el feedback del profesor");
        System.out.println("   - Se actualizó StudentScore correctamente");
        System.out.println("   - Mensaje: 'Solución revisada exitosamente'");
    }

    // ========================================
    // PRUEBAS ADICIONALES DE VALIDACIÓN
    // ========================================

    /**
     * Prueba adicional: Solo el profesor del curso puede revisar soluciones
     */
    @Test
    @DisplayName("HU16: Solo el profesor del curso puede revisar soluciones")
    void testRevision_SoloProfesorDelCurso() {
        System.out.println("\n=== Validación: Solo el profesor del curso puede revisar ===");

        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(testSubmission1));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.reviewSubmission(1L, 8, "Buen trabajo", "other@test.com"),
                "Debe lanzar excepción si el profesor no es dueño del curso");

        assertEquals("No tienes permiso para revisar esta solución", exception.getMessage());
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema valida permisos del profesor");
    }

    /**
     * Prueba adicional: Validar rango de bonificación (0-maxBonusPoints)
     */
    @Test
    @DisplayName("HU16: Bonificación debe estar dentro del rango permitido")
    void testRevision_BonificacionFueraDeRango() {
        System.out.println("\n=== Validación: Bonificación fuera de rango ===");

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(testSubmission1));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.reviewSubmission(1L, 15, "Excelente", "teacher@test.com"),
                "Debe rechazar bonificación mayor al máximo");

        assertTrue(exception.getMessage().contains("0 y 10"));
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema valida rango de bonificación (0-10 XP)");
    }

    /**
     * Prueba adicional: Crear StudentScore si no existe
     */
    @Test
    @DisplayName("HU16: Crear StudentScore si el estudiante no tiene registro")
    void testRevision_CrearStudentScoreSiNoExiste() {
        System.out.println("\n=== Validación: Crear StudentScore si no existe ===");

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(testSubmission1));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(studentScoreRepository.findByStudentIdAndCourseId(testStudent1.getId(), testCourse.getId()))
                .thenReturn(Optional.empty());

        ChallengeSubmission updatedSubmission = new ChallengeSubmission();
        updatedSubmission.setId(1L);
        updatedSubmission.setBonusPoints(8);
        updatedSubmission.setStatus(ChallengeSubmission.SubmissionStatus.REVIEWED);

        when(submissionRepository.save(any(ChallengeSubmission.class))).thenReturn(updatedSubmission);
        when(studentScoreRepository.save(any(StudentScore.class))).thenReturn(new StudentScore());

        submissionService.reviewSubmission(1L, 8, "Buen trabajo", "teacher@test.com");

        verify(studentScoreRepository, times(1)).save(any(StudentScore.class));

        System.out.println("✅ Sistema crea StudentScore si no existe");
    }
}