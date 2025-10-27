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
 * Pruebas Unitarias - Historia de Usuario 10 (HU10)
 * Subida de Ejercicio Desarrollado
 * 
 * Descripción: Como estudiante, quiero subir el ejercicio desarrollado
 * para que el docente pueda revisarlo y asignarme una calificación
 * 
 * Criterios de Aceptación:
 * CID 1: Cuando el estudiante selecciona un ejercicio y adjunta su archivo
 * desarrollado, luego hace clic en "Subir ejercicio"
 * → El sistema carga el archivo y muestra un mensaje de confirmación
 * 
 * CID 2: Cuando el estudiante intenta subir un ejercicio sin adjuntar archivo
 * → El botón "Subir ejercicio" se mantiene inhabilitado
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU10: Subida de Ejercicio Desarrollado")
class SubmissionServiceTest_HU10 {

        @Mock
        private SubmissionRepository submissionRepository;

        @Mock
        private ExerciseRepository exerciseRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private MultipartFile mockFile;

        @InjectMocks
        private SubmissionService submissionService;

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
                testCourse.setTitle("Programación Java");
                testCourse.setDescription("Curso de programación orientada a objetos");
                testCourse.setLevel("Intermedio");
                testCourse.setTeacher(testTeacher);
                testCourse.setStudents(new HashSet<>());
                testCourse.getStudents().add(testStudent);

                // Ejercicio del curso
                testExercise = new Exercise();
                testExercise.setId(1L);
                testExercise.setTitle("Sistema de Gestión de Biblioteca");
                testExercise.setDescription("Implementar un sistema básico de biblioteca");
                testExercise.setDifficulty("INTERMEDIO");
                testExercise.setCourse(testCourse);
                testExercise.setDeadline(LocalDateTime.now().plusDays(7));
        }

        // ========================================
        // CASOS DE PRUEBA PRINCIPALES - HU10
        // ========================================

        /**
         * CP010-01 - Escenario 01 (CID 1)
         * Subida exitosa de ejercicio desarrollado con archivo adjunto
         * 
         * Dado: Un estudiante inscrito en el curso con un ejercicio asignado
         * Cuando: Selecciona el ejercicio y adjunta su archivo desarrollado
         * (solucion.zip)
         * Y: Hace clic en "Subir ejercicio"
         * Entonces: El sistema carga el archivo en la base de datos
         * Y: Muestra un mensaje de confirmación
         * Y: Establece el estado como PENDING
         */
        @Test
        @DisplayName("CP010-01 - HU10: Subida exitosa de ejercicio desarrollado con archivo")
        void testCP010_01_SubidaExitosaConArchivo() throws Exception {
                // ==================== ARRANGE ====================
                System.out.println("\n=== CP010-01: Subida exitosa de ejercicio desarrollado ===");

                byte[] fileContent = "PK... [contenido del archivo ZIP con código Java]".getBytes();

                when(mockFile.getBytes()).thenReturn(fileContent);
                when(mockFile.getOriginalFilename()).thenReturn("solucion.zip");
                when(mockFile.getContentType()).thenReturn("application/zip");
                when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
                when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
                when(submissionRepository.existsByExerciseIdAndStudentId(1L, 2L)).thenReturn(false);

                Submission savedSubmission = new Submission();
                savedSubmission.setId(1L);
                savedSubmission.setExercise(testExercise);
                savedSubmission.setStudent(testStudent);
                savedSubmission.setFileData(fileContent);
                savedSubmission.setFileName("solucion.zip");
                savedSubmission.setFileType("application/zip");
                savedSubmission.setStatus(Submission.SubmissionStatus.PENDING);
                savedSubmission.setSubmittedAt(LocalDateTime.now());

                when(submissionRepository.save(any(Submission.class))).thenReturn(savedSubmission);

                // ==================== ACT ====================
                Submission result = submissionService.submitExercise(1L, "student@test.com", mockFile);

                // ==================== ASSERT ====================
                assertNotNull(result, "La entrega no debe ser nula");
                assertNotNull(result.getId(), "La entrega debe tener un ID asignado");
                assertTrue(result.hasFile(), "La entrega debe tener archivo adjunto");
                assertEquals("solucion.zip", result.getFileName(), "El nombre del archivo debe coincidir");
                assertEquals("application/zip", result.getFileType(), "El tipo de archivo debe ser ZIP");
                assertArrayEquals(fileContent, result.getFileData(), "El contenido del archivo debe coincidir");
                assertTrue(result.getFileData().length > 0, "El archivo debe tener contenido");
                assertEquals(Submission.SubmissionStatus.PENDING, result.getStatus(),
                                "El estado debe ser PENDING (pendiente de calificación)");
                assertNull(result.getGrade(), "No debe tener calificación aún");
                assertNull(result.getFeedback(), "No debe tener retroalimentación aún");
                assertNotNull(result.getSubmittedAt(), "Debe tener fecha de entrega");
                assertEquals(testStudent.getId(), result.getStudent().getId(),
                                "Debe estar asociado al estudiante correcto");
                assertEquals(testExercise.getId(), result.getExercise().getId(),
                                "Debe estar asociado al ejercicio correcto");

                verify(exerciseRepository, times(1)).findById(1L);
                verify(userRepository, times(1)).findByEmail("student@test.com");
                verify(submissionRepository, times(1)).existsByExerciseIdAndStudentId(1L, 2L);
                verify(submissionRepository, times(1)).save(any(Submission.class));
                verify(mockFile, times(1)).getBytes();
                verify(mockFile, times(1)).getOriginalFilename();
                verify(mockFile, times(1)).getContentType();

                // ==================== RESULTADO ====================
                System.out.println("CP010-01 PASÓ: Ejercicio desarrollado subido exitosamente");
                System.out.println("   Archivo: " + result.getFileName());
                System.out.println("   Tamaño: " + result.getFileData().length + " bytes");
                System.out.println("   Estudiante: " + result.getStudent().getNombre());
                System.out.println("   Ejercicio: " + result.getExercise().getTitle());
                System.out.println("   Fecha entrega: " + result.getSubmittedAt());
                System.out.println("   Estado: " + result.getStatus());
                System.out.println("   Mensaje: 'Ejercicio subido exitosamente. El profesor lo revisará pronto.'");
        }

        /**
         * CP010-02 - Escenario 02 (CID 2)
         * Intento de subir ejercicio sin archivo adjunto
         * 
         * Dado: Un estudiante inscrito en el curso con un ejercicio asignado
         * Cuando: Intenta subir un ejercicio sin adjuntar archivo (file = null)
         * Entonces: El sistema lanza una excepción
         * Y: NO guarda la entrega en la base de datos
         * 
         * NOTA: En el frontend, el botón "Subir ejercicio" debe estar inhabilitado
         * cuando no hay archivo seleccionado, pero el backend valida igualmente.
         */
        @Test
        @DisplayName("CP010-02 - HU10: Intento de subir ejercicio sin archivo adjunto")
        void testCP010_02_SubidaSinArchivo() {
                // ==================== ARRANGE ====================
                System.out.println("\n=== CP010-02: Intento de subir sin archivo ===");

                when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
                when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
                when(submissionRepository.existsByExerciseIdAndStudentId(1L, 2L)).thenReturn(false);

                // ==================== ACT & ASSERT ====================
                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> submissionService.submitExercise(1L, "student@test.com", null),
                                "Debe lanzar excepción cuando no hay archivo");

                String errorMessage = exception.getMessage();
                assertTrue(
                                errorMessage.contains("Error al procesar el archivo") ||
                                                errorMessage.contains("file") ||
                                                errorMessage.contains("null"),
                                "El mensaje debe indicar error con el archivo. Mensaje recibido: " + errorMessage);

                verify(submissionRepository, never()).save(any(Submission.class));

                // ==================== RESULTADO ====================
                System.out.println("CP010-02 PASÓ: Sistema rechaza subida sin archivo");
                System.out.println("   Error: " + errorMessage);
                System.out.println("   Validación: No se guardó ninguna entrega en la base de datos");
                System.out.println("   Frontend: El botón 'Subir ejercicio' debe estar INHABILITADO");
                System.out.println("      cuando no hay archivo seleccionado (validación preventiva)");
        }
}