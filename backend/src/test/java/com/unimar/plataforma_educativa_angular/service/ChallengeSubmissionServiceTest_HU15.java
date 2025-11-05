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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 15 (HU15)
 * Subir Soluciones de Retos para Recibir Bonificaciones
 * 
 * Descripción: Verificar que el sistema permita a los estudiantes subir
 * soluciones de retos para recibir bonificaciones.
 * 
 * Datos de entrada:
 * {
 * challengeId: 1L,
 * studentEmail: "student@test.com",
 * file: solucion_reto.zip
 * }
 * 
 * Criterios de Aceptación:
 * CID 1: El sistema almacena la solución con estado PENDING y muestra mensaje
 * CID 2: El botón "Subir reto" debe estar inhabilitado cuando no hay archivo
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU15: Subir Soluciones de Retos")
class ChallengeSubmissionServiceTest_HU15 {

    @Mock
    private ChallengeSubmissionRepository submissionRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MultipartFile mockFile;

    @InjectMocks
    private ChallengeSubmissionService submissionService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;
    private Challenge testChallenge;

    @BeforeEach
    void setUp() {
        // Configurar profesor del curso
        testTeacher = new User();
        testTeacher.setId(1L);
        testTeacher.setEmail("teacher@test.com");
        testTeacher.setNombre("Profesor Test");
        testTeacher.setRole(Role.TEACHER);

        // Configurar estudiante inscrito
        testStudent = new User();
        testStudent.setId(2L);
        testStudent.setEmail("student@test.com");
        testStudent.setNombre("Estudiante Test");
        testStudent.setRole(Role.STUDENT);

        // Configurar curso de prueba
        testCourse = new Course();
        testCourse.setId(1L);
        testCourse.setTitle("Algoritmos Avanzados");
        testCourse.setDescription("Curso de algoritmos y estructuras de datos");
        testCourse.setLevel("Avanzado");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent);

        // Configurar reto activo
        testChallenge = new Challenge();
        testChallenge.setId(1L);
        testChallenge.setTitle("Implementar Árbol AVL");
        testChallenge.setDescription("Implementar un árbol AVL con todas sus operaciones");
        testChallenge.setDifficulty("AVANZADO");
        testChallenge.setMaxBonusPoints(10);
        testChallenge.setDeadline(LocalDateTime.now().plusDays(7));
        testChallenge.setCourse(testCourse);
        testChallenge.setActive(true);
    }

    // ========================================
    // CP015-1: Subida exitosa de solución de reto
    // ========================================

    /**
     * CP015-1 - HU15 - Escenario 01
     * Subida exitosa de solución de reto
     * 
     * Dado: Un estudiante inscrito en un curso con un reto activo
     * Cuando: Sube la solución del reto con los datos:
     * - challengeId: 1L
     * - studentEmail: "student@test.com"
     * - file: solucion.zip (archivo válido)
     * Entonces: El sistema almacena la solución en la base de datos
     * Y: Establece el estado como PENDING (sin revisar)
     * Y: Muestra el mensaje "Solución enviada exitosamente. El profesor la revisará
     * pronto."
     */
    @Test
    @DisplayName("CP015-1 - HU15: Subida exitosa de solución de reto")
    void testCP015_1_SubidaExitosaDeSolucion() throws Exception {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP015-1: Subida exitosa de solución de reto ===");

        // Datos de entrada según especificación
        byte[] fileContent = "PK... [contenido del archivo ZIP con la solución del reto]".getBytes();

        // Simular archivo ZIP con solución
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getBytes()).thenReturn(fileContent);
        when(mockFile.getOriginalFilename()).thenReturn("solucion.zip");
        when(mockFile.getContentType()).thenReturn("application/zip");

        // Configurar mocks
        when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        when(submissionRepository.existsByChallengeIdAndStudentId(1L, 2L)).thenReturn(false);

        // Simular solución guardada
        ChallengeSubmission savedSubmission = new ChallengeSubmission();
        savedSubmission.setId(1L);
        savedSubmission.setChallenge(testChallenge);
        savedSubmission.setStudent(testStudent);
        savedSubmission.setFileData(fileContent);
        savedSubmission.setFileName("solucion.zip");
        savedSubmission.setFileType("application/zip");
        savedSubmission.setStatus(ChallengeSubmission.SubmissionStatus.PENDING);
        savedSubmission.setSubmittedAt(LocalDateTime.now());
        savedSubmission.setEditCount(0);

        when(submissionRepository.save(any(ChallengeSubmission.class))).thenReturn(savedSubmission);

        // ==================== ACT ====================
        ChallengeSubmission result = submissionService.submitChallenge(
                1L,
                "student@test.com",
                mockFile);

        // ==================== ASSERT ====================
        assertNotNull(result, "La solución enviada no debe ser nula");
        assertNotNull(result.getId(), "La solución debe tener un ID asignado");

        // Validar archivo
        assertTrue(result.hasFile(), "La solución debe tener archivo adjunto");
        assertEquals("solucion.zip", result.getFileName(), "El nombre del archivo debe coincidir");
        assertEquals("application/zip", result.getFileType(), "El tipo de archivo debe ser ZIP");
        assertArrayEquals(fileContent, result.getFileData(), "El contenido del archivo debe coincidir");
        assertTrue(result.getFileData().length > 0, "El archivo debe tener contenido");

        // Validar estado PENDING (sin revisar)
        assertEquals(ChallengeSubmission.SubmissionStatus.PENDING, result.getStatus(),
                "El estado debe ser PENDING (sin revisar)");
        assertNull(result.getBonusPoints(), "No debe tener bonificación aún (sin revisar)");
        assertNull(result.getFeedback(), "No debe tener retroalimentación aún");
        assertNull(result.getReviewedAt(), "No debe tener fecha de revisión aún");

        // Validar datos de la solución
        assertNotNull(result.getSubmittedAt(), "Debe tener fecha de envío");
        assertEquals(0, result.getEditCount(), "El contador de ediciones debe ser 0");

        // Validar asociaciones
        assertEquals(testStudent.getId(), result.getStudent().getId(),
                "Debe estar asociada al estudiante correcto");
        assertEquals(testChallenge.getId(), result.getChallenge().getId(),
                "Debe estar asociada al reto correcto");

        // Verificar interacciones con los repositorios
        verify(challengeRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("student@test.com");
        verify(submissionRepository, times(1)).existsByChallengeIdAndStudentId(1L, 2L);
        verify(submissionRepository, times(1)).save(any(ChallengeSubmission.class));
        verify(mockFile, times(1)).getBytes();
        verify(mockFile, times(1)).getOriginalFilename();
        verify(mockFile, times(1)).getContentType();

        // ==================== RESULTADO ====================
        System.out.println("✅ CP015-1 PASÓ: Solución de reto enviada exitosamente");
        System.out.println("   Submission ID: " + result.getId());
        System.out.println("");
        System.out.println("📊 DETALLES DE LA SOLUCIÓN:");
        System.out.println("   Reto: " + testChallenge.getTitle());
        System.out.println("   Estudiante: " + testStudent.getNombre());
        System.out.println("   Archivo: " + result.getFileName());
        System.out.println("   Tipo: " + result.getFileType());
        System.out.println("   Tamaño: " + result.getFileData().length + " bytes");
        System.out.println("   Estado: " + result.getStatus() + " (sin revisar)");
        System.out.println("   Fecha de envío: " + result.getSubmittedAt());
        System.out.println("   Ediciones: " + result.getEditCount());
        System.out.println("");
        System.out.println("✅ VALIDACIÓN EXITOSA:");
        System.out.println("   - La solución se almacenó correctamente en la base de datos");
        System.out.println("   - El estado se estableció como PENDING (sin revisar)");
        System.out.println("   - El archivo se guardó completo e íntegro");
        System.out.println("   - No tiene bonificación ni retroalimentación (pendiente de revisión)");
        System.out.println("");
        System.out.println("   Mensaje esperado en frontend:");
        System.out.println("   'Solución enviada exitosamente. El profesor la revisará pronto.'");
    }

    // ========================================
    // CP015-2: Intento de subir sin archivo
    // ========================================

    /**
     * CP015-2 - HU15 - Escenario 02
     * Intento de subir solución sin archivo adjunto
     * 
     * Dado: Un estudiante inscrito en un curso con un reto activo
     * Cuando: Intenta subir la solución sin seleccionar archivo:
     * - challengeId: 1L
     * - studentEmail: "student@test.com"
     * - file: null (sin archivo)
     * Entonces: El sistema rechaza la operación
     * Y: NO guarda ninguna solución en la base de datos
     * 
     * NOTA: El botón "Subir reto" debe estar INHABILITADO en frontend
     * cuando no hay archivo seleccionado, pero el backend valida igualmente.
     */
    @Test
    @DisplayName("CP015-2 - HU15: Intento de subir solución sin archivo")
    void testCP015_2_IntentoSubirSinArchivo() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP015-2: Intento de subir solución sin archivo ===");

        // Datos de entrada sin archivo (file: null)
        // No configuramos mocks porque la excepción se lanza antes de usarlos
        lenient().when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        lenient().when(submissionRepository.existsByChallengeIdAndStudentId(1L, 2L)).thenReturn(false);

        // ==================== ACT & ASSERT ====================
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(
                        1L,
                        "student@test.com",
                        null // Sin archivo
                ),
                "Debe lanzar excepción cuando no hay archivo");

        assertEquals("Debes seleccionar un archivo para subir la solución", exception.getMessage(),
                "El mensaje de error debe indicar que falta el archivo");

        // Verificar que NO se guardó ninguna solución
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        // ==================== RESULTADO ====================
        System.out.println("✅ CP015-2 PASÓ: Sistema rechaza subida sin archivo");
        System.out.println("   Error: " + exception.getMessage());
        System.out.println("   Validación: NO se guardó ninguna solución en la base de datos");
        System.out.println("");
        System.out.println("📋 NOTA IMPORTANTE PARA FRONTEND:");
        System.out.println("   El botón 'Subir reto' debe estar INHABILITADO cuando:");
        System.out.println("   - No hay archivo seleccionado (file === null)");
        System.out.println("   - El archivo está vacío (file.size === 0)");
        System.out.println("");
        System.out.println("💡 IMPLEMENTACIÓN SUGERIDA:");
        System.out.println("   - Deshabilitar botón por defecto");
        System.out.println("   - Habilitar solo cuando se seleccione un archivo válido");
        System.out.println("   - Mostrar indicador de archivo seleccionado");
        System.out.println("   - Validar tamaño y tipo de archivo antes de enviar");
        System.out.println("   - Ejemplo:");
        System.out.println("     <button [disabled]=\"!selectedFile\">Subir reto</button>");
    }

    // ========================================
    // Pruebas adicionales de validación
    // ========================================

    /**
     * Prueba adicional: Solo estudiantes inscritos pueden subir soluciones
     */
    @Test
    @DisplayName("HU15: Solo estudiantes inscritos pueden subir soluciones")
    void testSoloEstudiantesInscritosPuedenSubir() throws Exception {
        System.out.println("\n=== Validación: Solo estudiantes inscritos pueden subir ===");

        // Estudiante NO inscrito en el curso
        User otherStudent = new User();
        otherStudent.setId(99L);
        otherStudent.setEmail("other@test.com");
        otherStudent.setRole(Role.STUDENT);

        byte[] fileContent = "contenido de solución".getBytes();
        lenient().when(mockFile.isEmpty()).thenReturn(false);
        lenient().when(mockFile.getBytes()).thenReturn(fileContent);
        lenient().when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        lenient().when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(1L, "other@test.com", mockFile),
                "Debe lanzar excepción para estudiante no inscrito");

        assertEquals("No estás inscrito en este curso", exception.getMessage());
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema valida que solo estudiantes inscritos pueden subir");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: No permitir subir solución a reto inactivo
     */
    @Test
    @DisplayName("HU15: No permitir subir solución a reto inactivo")
    void testNoPermitirSubirRetoInactivo() throws Exception {
        System.out.println("\n=== Validación: Reto inactivo ===");

        testChallenge.setActive(false); // Reto despublicado

        byte[] fileContent = "contenido".getBytes();
        lenient().when(mockFile.isEmpty()).thenReturn(false);
        lenient().when(mockFile.getBytes()).thenReturn(fileContent);
        lenient().when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(1L, "student@test.com", mockFile),
                "Debe lanzar excepción para reto inactivo");

        assertEquals("Este reto no está activo", exception.getMessage());
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema valida que el reto esté activo");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: No permitir subir solución duplicada
     */
    @Test
    @DisplayName("HU15: No permitir subir solución duplicada")
    void testNoPermitirSolucionDuplicada() throws Exception {
        System.out.println("\n=== Validación: Solución duplicada ===");

        byte[] fileContent = "contenido".getBytes();
        lenient().when(mockFile.isEmpty()).thenReturn(false);
        lenient().when(mockFile.getBytes()).thenReturn(fileContent);
        lenient().when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        lenient().when(submissionRepository.existsByChallengeIdAndStudentId(1L, 2L)).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(1L, "student@test.com", mockFile),
                "Debe lanzar excepción si ya existe una solución");

        assertTrue(exception.getMessage().contains("Ya has enviado una solución"));
        assertTrue(exception.getMessage().contains("Editar"));
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema previene soluciones duplicadas");
        System.out.println("   Error: " + exception.getMessage());
        System.out.println("   Sugerencia: Usar opción 'Editar' para actualizar la solución");
    }

    /**
     * Prueba adicional: No permitir subir después de la fecha límite
     */
    @Test
    @DisplayName("HU15: No permitir subir después de la fecha límite")
    void testNoPermitirSubirDespuesDeFechaLimite() throws Exception {
        System.out.println("\n=== Validación: Fecha límite vencida ===");

        testChallenge.setDeadline(LocalDateTime.now().minusDays(1)); // Fecha pasada

        byte[] fileContent = "contenido".getBytes();
        lenient().when(mockFile.isEmpty()).thenReturn(false);
        lenient().when(mockFile.getBytes()).thenReturn(fileContent);
        lenient().when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        lenient().when(submissionRepository.existsByChallengeIdAndStudentId(1L, 2L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(1L, "student@test.com", mockFile),
                "Debe lanzar excepción si la fecha límite pasó");

        assertEquals("La fecha límite de entrega ha pasado", exception.getMessage());
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema valida la fecha límite del reto");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Validar que el archivo no esté vacío
     */
    @Test
    @DisplayName("HU15: Rechazar archivo vacío")
    void testRechazarArchivoVacio() {
        System.out.println("\n=== Validación: Archivo vacío ===");

        lenient().when(mockFile.isEmpty()).thenReturn(true);
        lenient().when(challengeRepository.findById(1L)).thenReturn(Optional.of(testChallenge));
        lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        lenient().when(submissionRepository.existsByChallengeIdAndStudentId(1L, 2L)).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(1L, "student@test.com", mockFile),
                "Debe lanzar excepción para archivo vacío");

        assertEquals("Debes seleccionar un archivo para subir la solución", exception.getMessage());
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema rechaza archivos vacíos");
        System.out.println("   Error: " + exception.getMessage());
    }

    /**
     * Prueba adicional: Reto no encontrado
     */
    @Test
    @DisplayName("HU15: Error cuando el reto no existe")
    void testRetoNoExiste() throws Exception {
        System.out.println("\n=== Validación: Reto no encontrado ===");

        byte[] fileContent = "contenido".getBytes();
        lenient().when(mockFile.isEmpty()).thenReturn(false);
        lenient().when(mockFile.getBytes()).thenReturn(fileContent);
        lenient().when(challengeRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> submissionService.submitChallenge(999L, "student@test.com", mockFile),
                "Debe lanzar excepción cuando el reto no existe");

        assertEquals("Reto no encontrado", exception.getMessage());
        verify(submissionRepository, never()).save(any(ChallengeSubmission.class));

        System.out.println("✅ Sistema maneja correctamente reto no encontrado");
        System.out.println("   Error: " + exception.getMessage());
    }
}