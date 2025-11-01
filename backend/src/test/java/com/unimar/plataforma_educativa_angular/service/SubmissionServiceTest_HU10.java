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
import static org.mockito.Mockito.lenient;

/**
 * Pruebas Unitarias - Historia de Usuario 10 (HU10)
 * Subida de Ejercicio Desarrollado
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
                testCourse.setId(1L);
                testCourse.setTitle("Programación Java");
                testCourse.setDescription("Curso de programación orientada a objetos");
                testCourse.setLevel("Intermedio");
                testCourse.setTeacher(testTeacher);
                testCourse.setStudents(new HashSet<>());
                testCourse.getStudents().add(testStudent);

                testExercise = new Exercise();
                testExercise.setId(1L);
                testExercise.setTitle("Sistema de Gestión de Biblioteca");
                testExercise.setDescription("Implementar un sistema básico de biblioteca");
                testExercise.setDifficulty("INTERMEDIO");
                testExercise.setCourse(testCourse);
                testExercise.setDeadline(LocalDateTime.now().plusDays(7));
        }

        @Test
        @DisplayName("CP010-01 - HU10: Subida exitosa de ejercicio desarrollado")
        void testCP010_01_SubidaExitosaDeEjercicio() throws Exception {
                System.out.println("\n=== CP010-01: Subida exitosa de ejercicio desarrollado ===");

                byte[] fileContent = "PK... [contenido del archivo ZIP con solución]".getBytes();

                when(mockFile.isEmpty()).thenReturn(false);
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
                savedSubmission.setEditCount(0);

                when(submissionRepository.save(any(Submission.class))).thenReturn(savedSubmission);

                Submission result = submissionService.submitExercise(1L, "student@test.com", mockFile);

                assertNotNull(result);
                assertNotNull(result.getId());
                assertTrue(result.hasFile());
                assertEquals("solucion.zip", result.getFileName());
                assertEquals("application/zip", result.getFileType());
                assertArrayEquals(fileContent, result.getFileData());
                assertTrue(result.getFileData().length > 0);
                assertEquals(Submission.SubmissionStatus.PENDING, result.getStatus());
                assertNull(result.getGrade());
                assertNull(result.getFeedback());
                assertNotNull(result.getSubmittedAt());
                assertEquals(0, result.getEditCount());
                assertEquals(testStudent.getId(), result.getStudent().getId());
                assertEquals(testExercise.getId(), result.getExercise().getId());

                verify(exerciseRepository, times(1)).findById(1L);
                verify(userRepository, times(1)).findByEmail("student@test.com");
                verify(submissionRepository, times(1)).existsByExerciseIdAndStudentId(1L, 2L);
                verify(submissionRepository, times(1)).save(any(Submission.class));
                verify(mockFile, times(1)).getBytes();
                verify(mockFile, times(1)).getOriginalFilename();
                verify(mockFile, times(1)).getContentType();

                System.out.println("✅ VALIDACIÓN EXITOSA");
        }

        @Test
        @DisplayName("CP010-02 - HU10: Subida sin archivo adjunto")
        void testCP010_02_SubidaSinArchivo() {
                System.out.println("\n=== CP010-02: Subida sin archivo adjunto ===");

                // Hacemos lenient porque el método lanza excepción antes de usar los mocks
                lenient().when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
                lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
                lenient().when(submissionRepository.existsByExerciseIdAndStudentId(1L, 2L)).thenReturn(false);

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> submissionService.submitExercise(1L, "student@test.com", null));

                assertEquals("Debes seleccionar un archivo para subir la entrega", exception.getMessage());
                verify(submissionRepository, never()).save(any(Submission.class));

                System.out.println("✅ Sistema rechaza subida sin archivo");
        }

        @Test
        @DisplayName("HU10: Solo estudiantes inscritos pueden subir entregas")
        void testSubida_SoloEstudiantesInscritos() throws Exception {
                System.out.println("\n=== Validación: Solo estudiantes inscritos pueden subir ===");

                User otherStudent = new User();
                otherStudent.setId(99L);
                otherStudent.setEmail("other@test.com");
                otherStudent.setRole(Role.STUDENT);

                Course courseWithoutStudent = new Course();
                courseWithoutStudent.setId(1L);
                courseWithoutStudent.setTeacher(testTeacher);
                courseWithoutStudent.setStudents(new HashSet<>());

                Exercise exercise = new Exercise();
                exercise.setId(1L);
                exercise.setCourse(courseWithoutStudent);

                byte[] fileContent = "contenido".getBytes();
                lenient().when(mockFile.isEmpty()).thenReturn(false);
                lenient().when(mockFile.getBytes()).thenReturn(fileContent);
                lenient().when(exerciseRepository.findById(1L)).thenReturn(Optional.of(exercise));
                lenient().when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherStudent));

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> submissionService.submitExercise(1L, "other@test.com", mockFile));

                assertEquals("No estás inscrito en este curso", exception.getMessage());
                verify(submissionRepository, never()).save(any(Submission.class));
        }

        @Test
        @DisplayName("HU10: No permitir subir ejercicio ya entregado")
        void testSubida_NoPermitirDuplicados() throws Exception {
                System.out.println("\n=== Validación: No permitir entregas duplicadas ===");

                byte[] fileContent = "contenido".getBytes();
                lenient().when(mockFile.isEmpty()).thenReturn(false);
                lenient().when(mockFile.getBytes()).thenReturn(fileContent);
                lenient().when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
                lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
                lenient().when(submissionRepository.existsByExerciseIdAndStudentId(1L, 2L)).thenReturn(true);

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> submissionService.submitExercise(1L, "student@test.com", mockFile));

                assertTrue(exception.getMessage().contains("Ya has entregado este ejercicio"));
                verify(submissionRepository, never()).save(any(Submission.class));
        }

        @Test
        @DisplayName("HU10: No permitir subir después de la fecha límite")
        void testSubida_DespuesDeFechaLimite() throws Exception {
                System.out.println("\n=== Validación: Fecha límite de entrega ===");

                testExercise.setDeadline(LocalDateTime.now().minusDays(1));

                byte[] fileContent = "contenido".getBytes();
                lenient().when(mockFile.isEmpty()).thenReturn(false);
                lenient().when(mockFile.getBytes()).thenReturn(fileContent);
                lenient().when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
                lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
                lenient().when(submissionRepository.existsByExerciseIdAndStudentId(1L, 2L)).thenReturn(false);

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> submissionService.submitExercise(1L, "student@test.com", mockFile));

                assertEquals("La fecha límite de entrega ha pasado", exception.getMessage());
                verify(submissionRepository, never()).save(any(Submission.class));
        }

        @Test
        @DisplayName("HU10: Rechazar archivo vacío")
        void testSubida_ArchivoVacio() {
                System.out.println("\n=== Validación: Archivo vacío ===");

                lenient().when(mockFile.isEmpty()).thenReturn(true);
                lenient().when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
                lenient().when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
                lenient().when(submissionRepository.existsByExerciseIdAndStudentId(1L, 2L)).thenReturn(false);

                RuntimeException exception = assertThrows(
                                RuntimeException.class,
                                () -> submissionService.submitExercise(1L, "student@test.com", mockFile));

                assertEquals("Debes seleccionar un archivo para subir la entrega", exception.getMessage());
                verify(submissionRepository, never()).save(any(Submission.class));

                System.out.println("✅ Sistema rechaza archivos vacíos");
        }
}
