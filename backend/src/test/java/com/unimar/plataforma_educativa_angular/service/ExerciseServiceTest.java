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
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas del Servicio de Ejercicios - HU7 y HU9")
class ExerciseServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MultipartFile mockFile;

    @InjectMocks
    private ExerciseService exerciseService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;
    private Exercise testExercise;

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
        testCourse.setId(1L);
        testCourse.setTitle("Matemáticas I");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
        testCourse.getStudents().add(testStudent);

        testExercise = new Exercise();
        testExercise.setId(1L);
        testExercise.setTitle("Ejercicio Básico");
        testExercise.setDescription("Resolver problemas de álgebra");
        testExercise.setDifficulty("BASICO");
        testExercise.setCourse(testCourse);
    }

    // ========================================
    // HU7: Pruebas de Subida de Ejercicios
    // ========================================

    @Test
    @DisplayName("CP007-01 - HU7: Subida exitosa de ejercicio con archivo")
    void testCreateExercise_WithFile_Success() throws Exception {
        // Arrange
        Exercise exerciseToCreate = new Exercise();
        exerciseToCreate.setTitle("Ejercicio Básico");
        exerciseToCreate.setDescription("Resolver problemas");
        exerciseToCreate.setDifficulty("BASICO");

        byte[] fileContent = "contenido del archivo pdf".getBytes();
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getBytes()).thenReturn(fileContent);
        when(mockFile.getOriginalFilename()).thenReturn("ejercicio.pdf");
        when(mockFile.getContentType()).thenReturn("application/pdf");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        Exercise savedExercise = new Exercise();
        savedExercise.setId(1L);
        savedExercise.setTitle("Ejercicio Básico");
        savedExercise.setDescription("Resolver problemas");
        savedExercise.setDifficulty("BASICO");
        savedExercise.setFileData(fileContent);
        savedExercise.setFileName("ejercicio.pdf");
        savedExercise.setFileType("application/pdf");
        savedExercise.setCourse(testCourse);

        when(exerciseRepository.save(any(Exercise.class))).thenReturn(savedExercise);

        // Act
        Exercise result = exerciseService.createExercise(exerciseToCreate, 1L, "teacher@test.com", mockFile);

        // Assert
        assertNotNull(result, "El ejercicio creado no debe ser nulo");
        assertTrue(result.hasFile(), "El ejercicio debe tener archivo adjunto");
        assertEquals("ejercicio.pdf", result.getFileName(), "El nombre del archivo debe coincidir");
        assertEquals("application/pdf", result.getFileType(), "El tipo de archivo debe coincidir");
        assertArrayEquals(fileContent, result.getFileData(), "El contenido del archivo debe coincidir");
        assertEquals("Ejercicio Básico", result.getTitle(), "El título debe coincidir");

        // Verificar interacciones
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(exerciseRepository, times(1)).save(any(Exercise.class));
        verify(mockFile, times(1)).getBytes();

        System.out.println("CP007-01 PASÓ: Ejercicio con archivo subido exitosamente");
        System.out.println("   Archivo: " + result.getFileName());
        System.out.println("   Tamaño: " + result.getFileData().length + " bytes");
    }

    @Test
    @DisplayName("CP007-02 - HU7: Creación de ejercicio sin archivo adjunto")
    void testCreateExercise_WithoutFile_Success() {
        // Arrange
        Exercise exerciseToCreate = new Exercise();
        exerciseToCreate.setTitle("Ejercicio Básico");
        exerciseToCreate.setDescription("Resolver problemas");
        exerciseToCreate.setDifficulty("BASICO");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        Exercise savedExercise = new Exercise();
        savedExercise.setId(1L);
        savedExercise.setTitle("Ejercicio Básico");
        savedExercise.setDescription("Resolver problemas");
        savedExercise.setDifficulty("BASICO");
        savedExercise.setCourse(testCourse);

        when(exerciseRepository.save(any(Exercise.class))).thenReturn(savedExercise);

        // Act
        Exercise result = exerciseService.createExercise(exerciseToCreate, 1L, "teacher@test.com", null);

        // Assert
        assertNotNull(result, "El ejercicio creado no debe ser nulo");
        assertFalse(result.hasFile(), "El ejercicio no debe tener archivo adjunto");
        assertNull(result.getFileData(), "El contenido del archivo debe ser nulo");
        assertEquals("Ejercicio Básico", result.getTitle(), "El título debe coincidir");

        verify(exerciseRepository, times(1)).save(any(Exercise.class));

        System.out.println("CP007-02 PASÓ: Ejercicio sin archivo creado correctamente");
        System.out.println("   (El botón 'Subir ejercicio' debe estar inhabilitado en frontend)");
    }

    @Test
    @DisplayName("HU7: Solo el profesor del curso puede subir ejercicios")
    void testCreateExercise_OnlyTeacherCanUpload() {
        // Arrange
        Exercise exerciseToCreate = new Exercise();
        exerciseToCreate.setTitle("Ejercicio Básico");

        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> exerciseService.createExercise(exerciseToCreate, 1L, "other@test.com", null));

        assertEquals("No tienes permiso para agregar ejercicios a este curso", exception.getMessage());
        verify(exerciseRepository, never()).save(any(Exercise.class));

        System.out.println("Sistema valida que solo el profesor del curso puede subir ejercicios");
    }

    // ========================================
    // HU9: Pruebas de Descarga de Ejercicios
    // ========================================

    @Test
    @DisplayName("CP009-01 - HU9: Descarga exitosa de ejercicio con archivo")
    void testDownloadExercise_Success() throws Exception {
        // Arrange
        byte[] fileContent = "contenido del ejercicio".getBytes();
        testExercise.setFileData(fileContent);
        testExercise.setFileName("ejercicio.pdf");
        testExercise.setFileType("application/pdf");

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        // Act
        byte[] result = exerciseService.getExerciseFile(1L, "student@test.com");

        // Assert
        assertNotNull(result, "El contenido del archivo no debe ser nulo");
        assertArrayEquals(fileContent, result, "El contenido descargado debe coincidir");
        assertEquals(fileContent.length, result.length, "El tamaño debe coincidir");

        verify(exerciseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("student@test.com");

        System.out.println("CP009-01 PASÓ: Archivo descargado exitosamente");
        System.out.println("   Archivo: " + testExercise.getFileName());
        System.out.println("   Tamaño: " + result.length + " bytes");
    }

    @Test
    @DisplayName("CP009-02 - HU9: Lista vacía cuando no hay ejercicios disponibles")
    void testGetExercises_EmptyList() {
        // Arrange
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        when(exerciseRepository.findByCourseId(1L)).thenReturn(new ArrayList<>());

        // Act
        List<Exercise> result = exerciseService.getExercisesByCourse(1L, "student@test.com");

        // Assert
        assertNotNull(result, "La lista no debe ser nula");
        assertTrue(result.isEmpty(), "La lista debe estar vacía");
        assertEquals(0, result.size(), "No debe haber ejercicios");

        verify(exerciseRepository, times(1)).findByCourseId(1L);

        System.out.println("CP009-02 PASÓ: Sistema devuelve lista vacía correctamente");
        System.out.println("   (Frontend debe mostrar: 'No existen ejercicios asignados actualmente')");
    }

    @Test
    @DisplayName("CP009-03 - HU9: Error al descargar ejercicio sin archivo adjunto")
    void testDownloadExercise_NoFile_ThrowsException() {
        // Arrange
        testExercise.setFileData(null);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> exerciseService.getExerciseFile(1L, "student@test.com"));

        assertEquals("Este ejercicio no tiene archivo adjunto", exception.getMessage());

        System.out.println("CP009-03 PASÓ: Sistema maneja correctamente ejercicios sin archivo");
        System.out.println("   Mensaje: " + exception.getMessage());
    }

    @Test
    @DisplayName("HU9: Solo estudiantes del curso pueden descargar ejercicios")
    void testDownloadExercise_OnlyEnrolledStudents() {
        // Arrange
        User otherStudent = new User();
        otherStudent.setId(99L);
        otherStudent.setEmail("other@test.com");
        otherStudent.setRole(Role.STUDENT);

        byte[] fileContent = "contenido".getBytes();
        testExercise.setFileData(fileContent);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherStudent));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> exerciseService.getExerciseFile(1L, "other@test.com"));

        assertEquals("No tienes acceso a este ejercicio", exception.getMessage());

        System.out.println("Sistema valida que solo estudiantes inscritos pueden descargar");
    }
}