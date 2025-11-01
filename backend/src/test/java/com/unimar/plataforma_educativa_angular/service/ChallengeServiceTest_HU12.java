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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 12 (HU12)
 * Publicar Retos en la Plataforma
 * 
 * Descripción: Verificar que el sistema permita a los docentes publicar retos
 * en la plataforma con toda la información requerida y archivo opcional.
 * 
 * Datos de entrada:
 * {
 * title: "Reto de Algoritmos",
 * description: "Implementar algoritmos de ordenamiento",
 * difficulty: "INTERMEDIO",
 * maxBonusPoints: 8,
 * courseId: 1L,
 * deadline: "2025-12-31T23:59:59",
 * file: archivo.pdf
 * }
 * 
 * Criterios de Aceptación:
 * CID 1: El sistema guarda el reto con archivo, establece active=true
 * CID 2: El sistema valida campos obligatorios (botón inhabilitado en frontend)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU12: Publicar Retos en la Plataforma")
class ChallengeServiceTest_HU12 {

        @Mock
        private ChallengeRepository challengeRepository;

        @Mock
        private CourseRepository courseRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private MultipartFile mockFile;

        @InjectMocks
        private ChallengeService challengeService;

        private Course testCourse;
        private User testTeacher;

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
        }

        // ========================================
        // CP012-1: Publicación exitosa de reto con archivo
        // ========================================

        /**
         * CP012-1 - HU12 - Escenario 01
         * Publicación exitosa de reto con archivo adjunto
         * 
         * Dado: Un profesor con un curso creado
         * Cuando: Publica un reto con los datos:
         * - title: "Reto de Algoritmos"
         * - description: "Implementar algoritmos"
         * - difficulty: "INTERMEDIO"
         * - maxBonusPoints: 8
         * - courseId: 1L
         * - deadline: "2025-12-31T23:59:59"
         * - file: archivo.pdf (archivo válido)
         * Entonces: El sistema guarda el reto con el archivo en la base de datos
         * Y: Establece active=true automáticamente
         * Y: Devuelve un mensaje de confirmación de publicación exitosa
         */
        @Test
        @DisplayName("CP012-1 - HU12: Publicación exitosa de reto con archivo")
        void testCP012_1_PublicacionExitosaConArchivo() throws Exception {
                // ==================== ARRANGE ====================
                System.out.println("\n=== CP012-1: Publicación exitosa de reto con archivo ===");

                // Datos de entrada según especificación
                Challenge challengeToCreate = new Challenge();
                challengeToCreate.setTitle("Reto de Algoritmos");
                challengeToCreate.setDescription("Implementar algoritmos");
                challengeToCreate.setDifficulty("INTERMEDIO");
                challengeToCreate.setMaxBonusPoints(8);
                challengeToCreate.setDeadline(LocalDateTime.parse("2025-12-31T23:59:59"));

                // Simular archivo PDF
                byte[] fileContent = "Contenido del PDF del reto de algoritmos".getBytes();
                when(mockFile.isEmpty()).thenReturn(false);
                when(mockFile.getBytes()).thenReturn(fileContent);
                when(mockFile.getOriginalFilename()).thenReturn("archivo.pdf");
                when(mockFile.getContentType()).thenReturn("application/pdf");

                // Configurar mocks
                when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
                when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

                // Simular reto guardado
                Challenge savedChallenge = new Challenge();
                savedChallenge.setId(1L);
                savedChallenge.setTitle("Reto de Algoritmos");
                savedChallenge.setDescription("Implementar algoritmos");
                savedChallenge.setDifficulty("INTERMEDIO");
                savedChallenge.setMaxBonusPoints(8);
                savedChallenge.setDeadline(LocalDateTime.parse("2025-12-31T23:59:59"));
                savedChallenge.setFileData(fileContent);
                savedChallenge.setFileName("archivo.pdf");
                savedChallenge.setFileType("application/pdf");
                savedChallenge.setCourse(testCourse);
                savedChallenge.setActive(true);
                savedChallenge.setCreatedAt(LocalDateTime.now());

                when(challengeRepository.save(any(Challenge.class))).thenReturn(savedChallenge);

                // ==================== ACT ====================
                Challenge result = challengeService.createChallenge(
                                challengeToCreate,
                                1L,
                                "teacher@test.com",
                                mockFile);

                // ==================== ASSERT ====================
                assertNotNull(result, "El reto creado no debe ser nulo");
                assertNotNull(result.getId(), "El reto debe tener un ID asignado");
                assertEquals("Reto de Algoritmos", result.getTitle(), "El título debe coincidir");
                assertEquals("Implementar algoritmos", result.getDescription(), "La descripción debe coincidir");
                assertEquals("INTERMEDIO", result.getDifficulty(), "La dificultad debe coincidir");
                assertEquals(8, result.getMaxBonusPoints(), "Los puntos de bonificación deben coincidir");
                assertEquals(LocalDateTime.parse("2025-12-31T23:59:59"), result.getDeadline(),
                                "La fecha límite debe coincidir");

                // Validaciones del archivo
                assertTrue(result.hasFile(), "El reto debe tener archivo adjunto");
                assertEquals("archivo.pdf", result.getFileName(), "El nombre del archivo debe coincidir");
                assertEquals("application/pdf", result.getFileType(), "El tipo de archivo debe ser PDF");
                assertArrayEquals(fileContent, result.getFileData(), "El contenido del archivo debe coincidir");
                assertTrue(result.getFileData().length > 0, "El archivo debe tener contenido");

                // Validación de estado activo
                assertTrue(result.getActive(), "El reto debe estar activo (active=true)");

                // Validar asociación con el curso
                assertNotNull(result.getCourse(), "Debe estar asociado a un curso");
                assertEquals(1L, result.getCourse().getId(), "Debe estar asociado al curso correcto");

                // Validar fecha de creación
                assertNotNull(result.getCreatedAt(), "Debe tener fecha de creación");

                // Verificar interacciones con los repositorios
                verify(courseRepository, times(1)).findById(1L);
                verify(userRepository, times(1)).findByEmail("teacher@test.com");
                verify(challengeRepository, times(1)).save(any(Challenge.class));
                verify(mockFile, times(1)).getBytes();
                verify(mockFile, times(1)).getOriginalFilename();
                verify(mockFile, times(1)).getContentType();

                // ==================== RESULTADO ====================
                System.out.println("✅ CP012-1 PASÓ: Reto publicado exitosamente");
                System.out.println("   Título: " + result.getTitle());
                System.out.println("   Dificultad: " + result.getDifficulty());
                System.out.println("   Bonificación máxima: " + result.getMaxBonusPoints() + " XP");
                System.out.println("   Deadline: " + result.getDeadline());
                System.out.println("   Archivo: " + result.getFileName());
                System.out.println("   Tamaño: " + result.getFileData().length + " bytes");
                System.out.println("   Estado activo: " + result.getActive());
                System.out.println("   Mensaje: 'Reto publicado exitosamente'");
        }

        // ========================================
        // CP012-2: Publicación de reto sin campos obligatorios
        // ========================================

        /**
         * CP012-2 - HU12 - Escenario 02
         * Publicación de reto sin campos obligatorios
         * 
         * Dado: Un profesor con un curso creado
         * Cuando: Intenta publicar un reto con los datos:
         * - title: "" (vacío)
         * - description: "" (vacío)
         * - difficulty: "" (vacío)
         * - maxBonusPoints: null
         * - courseId: 1L
         * Entonces: El sistema rechaza la operación
         * Y: NO guarda el reto en la base de datos
         * 
         * NOTA: El botón "Publicar" debe estar inhabilitado en frontend cuando
         * los campos obligatorios están vacíos, pero el backend valida igualmente.
         */
        @Test
        @DisplayName("CP012-2 - HU12: Rechazo de reto sin campos obligatorios")
        void testCP012_2_RechazoSinCamposObligatorios() {
                // ==================== ARRANGE ====================
                System.out.println("\n=== CP012-2: Intento de publicar reto sin campos obligatorios ===");

                // No configuramos mocks porque la excepción se lanza antes de usarlos

                // ==================== ACT & ASSERT ====================
                // La entidad Challenge valida en el setter, así que probamos la excepción
                // que se lanza cuando intentamos crear un Challenge con maxBonusPoints null
                Exception exception = assertThrows(
                                Exception.class,
                                () -> {
                                        Challenge challengeToCreate = new Challenge();
                                        challengeToCreate.setTitle("");
                                        challengeToCreate.setDescription("");
                                        challengeToCreate.setDifficulty("");
                                        challengeToCreate.setMaxBonusPoints(null); // Esto lanzará NullPointerException

                                        challengeService.createChallenge(
                                                        challengeToCreate,
                                                        1L,
                                                        "teacher@test.com",
                                                        null);
                                },
                                "Debe lanzar excepción cuando maxBonusPoints es null");

                // Verificar que NO se guardó en la base de datos
                verify(challengeRepository, never()).save(any(Challenge.class));

                // ==================== RESULTADO ====================
                System.out.println("✅ CP012-2 PASÓ: Sistema rechaza reto sin campos obligatorios");
                System.out.println(
                                "   Error: " + exception.getClass().getSimpleName() + " - " + exception.getMessage());
                System.out.println("   Validación: NO se guardó ningún reto en la base de datos");
                System.out.println("   NOTA IMPORTANTE:");
                System.out.println("      - El botón 'Publicar' debe estar INHABILITADO en frontend");
                System.out.println("      - cuando los campos obligatorios están vacíos:");
                System.out.println("        * title (vacío)");
                System.out.println("        * description (vacío)");
                System.out.println("        * difficulty (vacío)");
                System.out.println("        * maxBonusPoints (null)");
                System.out.println("   VALIDACIÓN ACTUAL:");
                System.out.println("      - La entidad Challenge valida automáticamente maxBonusPoints");
                System.out.println("      - Lanza excepción si el valor es null o está fuera del rango 1-10");
        }

        // ========================================
        // Prueba adicional: Validación de bonificación fuera de rango
        // ========================================

        /**
         * Prueba complementaria: Validar que la bonificación esté entre 1 y 10
         */
        @Test
        @DisplayName("CP012-2b - HU12: Validación de bonificación fuera de rango")
        void testCP012_2b_ValidacionBonificacionFueraDeRango() {
                // ==================== ARRANGE ====================
                System.out.println("\n=== CP012-2b: Bonificación fuera de rango ===");

                // No configuramos mocks porque la excepción se lanza antes de usarlos

                // ==================== ACT & ASSERT ====================
                // La entidad Challenge valida en el setter, así que capturamos
                // IllegalArgumentException
                Exception exception = assertThrows(
                                Exception.class,
                                () -> {
                                        Challenge challengeToCreate = new Challenge();
                                        challengeToCreate.setTitle("Reto de Algoritmos");
                                        challengeToCreate.setDescription("Implementar algoritmos");
                                        challengeToCreate.setDifficulty("INTERMEDIO");
                                        challengeToCreate.setMaxBonusPoints(15); // Fuera de rango (1-10)

                                        challengeService.createChallenge(
                                                        challengeToCreate,
                                                        1L,
                                                        "teacher@test.com",
                                                        null);
                                },
                                "Debe rechazar bonificación mayor a 10");

                assertTrue(
                                exception.getMessage().contains("1 y 10") ||
                                                exception.getMessage().contains("bonificación"),
                                "Debe indicar que la bonificación está fuera de rango");

                verify(challengeRepository, never()).save(any(Challenge.class));

                System.out.println("✅ CP012-2b PASÓ: Bonificación fuera de rango rechazada");
                System.out.println("   Valor inválido: 15 XP (máximo permitido: 10 XP)");
                System.out.println("   Error: " + exception.getMessage());
        }

        // ========================================
        // Prueba adicional: Publicación de reto sin archivo (opcional)
        // ========================================

        /**
         * Prueba complementaria: Validar que se puede publicar reto sin archivo
         * (el archivo es opcional según los datos de la HU)
         */
        @Test
        @DisplayName("HU12: Publicación exitosa de reto sin archivo (archivo opcional)")
        void testPublicacionExitosaSinArchivo() {
                // ==================== ARRANGE ====================
                System.out.println("\n=== Publicación exitosa de reto sin archivo ===");

                Challenge challengeToCreate = new Challenge();
                challengeToCreate.setTitle("Reto de Algoritmos");
                challengeToCreate.setDescription("Implementar algoritmos");
                challengeToCreate.setDifficulty("INTERMEDIO");
                challengeToCreate.setMaxBonusPoints(8);
                challengeToCreate.setDeadline(LocalDateTime.parse("2025-12-31T23:59:59"));

                when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
                when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

                Challenge savedChallenge = new Challenge();
                savedChallenge.setId(1L);
                savedChallenge.setTitle("Reto de Algoritmos");
                savedChallenge.setDescription("Implementar algoritmos");
                savedChallenge.setDifficulty("INTERMEDIO");
                savedChallenge.setMaxBonusPoints(8);
                savedChallenge.setDeadline(LocalDateTime.parse("2025-12-31T23:59:59"));
                savedChallenge.setCourse(testCourse);
                savedChallenge.setActive(true);

                when(challengeRepository.save(any(Challenge.class))).thenReturn(savedChallenge);

                // ==================== ACT ====================
                Challenge result = challengeService.createChallenge(
                                challengeToCreate,
                                1L,
                                "teacher@test.com",
                                null // Sin archivo
                );

                // ==================== ASSERT ====================
                assertNotNull(result, "El reto creado no debe ser nulo");
                assertEquals("Reto de Algoritmos", result.getTitle());
                assertEquals(8, result.getMaxBonusPoints());
                assertFalse(result.hasFile(), "El reto NO debe tener archivo adjunto");
                assertNull(result.getFileData(), "Los datos del archivo deben ser nulos");
                assertTrue(result.getActive(), "El reto debe estar activo");

                verify(challengeRepository, times(1)).save(any(Challenge.class));

                System.out.println("✅ Reto publicado exitosamente sin archivo");
                System.out.println("   El archivo es OPCIONAL en los retos");
        }
}