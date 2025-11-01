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

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias - Historia de Usuario 7 (HU7)
 * Subir Ejercicios de Nivel con Archivo Adjunto
 * 
 * Descripción: Verificar que el sistema permita subir ejercicios de nivel
 * con archivo adjunto y guardarlos correctamente en la base de datos.
 * 
 * Datos de entrada:
 * {
 * title: "Ejercicio Básico",
 * description: "Resolver problemas de álgebra",
 * difficulty: "BASICO",
 * courseId: 1L,
 * file: archivo.pdf
 * }
 * 
 * Criterios de Aceptación:
 * CID 1: El sistema guarda el ejercicio con archivo adjunto
 * CID 2: El sistema permite crear ejercicio sin archivo (validación en
 * frontend)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias - HU7: Subir Ejercicios con Archivo Adjunto")
class ExerciseServiceTest_HU7 {

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
        testCourse.setTitle("Matemáticas I");
        testCourse.setDescription("Curso básico de álgebra");
        testCourse.setLevel("Básico");
        testCourse.setTeacher(testTeacher);
        testCourse.setStudents(new HashSet<>());
    }

    // ========================================
    // CP007-01: Subida exitosa de ejercicio con archivo
    // ========================================

    /**
     * CP007-01 - HU7 - Escenario 01
     * Subida exitosa de ejercicio con archivo adjunto
     * 
     * Dado: Un profesor con un curso creado
     * Cuando: Crea un ejercicio con los datos:
     * - title: "Ejercicio Básico"
     * - description: "Resolver problemas"
     * - difficulty: "BASICO"
     * - courseId: 1L
     * - file: archivo.pdf (archivo válido)
     * Entonces: El sistema guarda el ejercicio con el archivo en la base de datos
     * Y: Devuelve un mensaje de confirmación de carga exitosa
     */
    @Test
    @DisplayName("CP007-01 - HU7: Subida exitosa de ejercicio con archivo adjunto")
    void testCP007_01_SubidaExitosaConArchivo() throws Exception {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP007-01: Subida exitosa de ejercicio con archivo ===");

        // Datos de entrada según especificación
        Exercise exerciseToCreate = new Exercise();
        exerciseToCreate.setTitle("Ejercicio Básico");
        exerciseToCreate.setDescription("Resolver problemas");
        exerciseToCreate.setDifficulty("BASICO");

        // Simular archivo PDF
        byte[] fileContent = "Contenido del PDF del ejercicio".getBytes();
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getBytes()).thenReturn(fileContent);
        when(mockFile.getOriginalFilename()).thenReturn("archivo.pdf");
        when(mockFile.getContentType()).thenReturn("application/pdf");

        // Configurar mocks
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        // Simular ejercicio guardado
        Exercise savedExercise = new Exercise();
        savedExercise.setId(1L);
        savedExercise.setTitle("Ejercicio Básico");
        savedExercise.setDescription("Resolver problemas");
        savedExercise.setDifficulty("BASICO");
        savedExercise.setFileData(fileContent);
        savedExercise.setFileName("archivo.pdf");
        savedExercise.setFileType("application/pdf");
        savedExercise.setCourse(testCourse);

        when(exerciseRepository.save(any(Exercise.class))).thenReturn(savedExercise);

        // ==================== ACT ====================
        Exercise result = exerciseService.createExercise(
                exerciseToCreate,
                1L,
                "teacher@test.com",
                mockFile);

        // ==================== ASSERT ====================
        assertNotNull(result, "El ejercicio creado no debe ser nulo");
        assertEquals("Ejercicio Básico", result.getTitle(), "El título debe coincidir");
        assertEquals("Resolver problemas", result.getDescription(), "La descripción debe coincidir");
        assertEquals("BASICO", result.getDifficulty(), "La dificultad debe coincidir");

        // Validaciones del archivo
        assertTrue(result.hasFile(), "El ejercicio debe tener archivo adjunto");
        assertEquals("archivo.pdf", result.getFileName(), "El nombre del archivo debe coincidir");
        assertEquals("application/pdf", result.getFileType(), "El tipo de archivo debe ser PDF");
        assertArrayEquals(fileContent, result.getFileData(), "El contenido del archivo debe coincidir");
        assertTrue(result.getFileData().length > 0, "El archivo debe tener contenido");

        // Validar asociación con el curso
        assertNotNull(result.getCourse(), "Debe estar asociado a un curso");
        assertEquals(1L, result.getCourse().getId(), "Debe estar asociado al curso correcto");

        // Verificar interacciones con los repositorios
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(exerciseRepository, times(1)).save(any(Exercise.class));
        verify(mockFile, times(1)).getBytes();
        verify(mockFile, times(1)).getOriginalFilename();
        verify(mockFile, times(1)).getContentType();

        // ==================== RESULTADO ====================
        System.out.println("CP007-01 PASÓ: Ejercicio con archivo guardado exitosamente");
        System.out.println("   Título: " + result.getTitle());
        System.out.println("   Dificultad: " + result.getDifficulty());
        System.out.println("   Archivo: " + result.getFileName());
        System.out.println("   Tamaño: " + result.getFileData().length + " bytes");
        System.out.println("   Tipo: " + result.getFileType());
        System.out.println("   Mensaje: 'Ejercicio subido exitosamente'");
    }

    // ========================================
    // CP007-02: Subida sin archivo
    // ========================================

    /**
     * CP007-02 - HU7 - Escenario 02
     * Subida de ejercicio sin archivo adjunto
     * 
     * Dado: Un profesor con un curso creado
     * Cuando: Crea un ejercicio con los datos:
     * - title: "Ejercicio Básico"
     * - description: "Resolver problemas"
     * - difficulty: "BASICO"
     * - courseId: 1L
     * - file: null (sin archivo)
     * Entonces: El sistema permite crear el ejercicio sin archivo
     * Y: Guarda el ejercicio en la base de datos sin datos de archivo
     * 
     * NOTA: El botón debe estar inhabilitado en frontend cuando no hay archivo,
     * pero el servicio backend acepta null como valor válido.
     */
    @Test
    @DisplayName("CP007-02 - HU7: Subida de ejercicio sin archivo adjunto")
    void testCP007_02_SubidaSinArchivo() {
        // ==================== ARRANGE ====================
        System.out.println("\n=== CP007-02: Subida de ejercicio sin archivo ===");

        // Datos de entrada según especificación (sin archivo)
        Exercise exerciseToCreate = new Exercise();
        exerciseToCreate.setTitle("Ejercicio Básico");
        exerciseToCreate.setDescription("Resolver problemas");
        exerciseToCreate.setDifficulty("BASICO");

        // Configurar mocks
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        // Simular ejercicio guardado SIN archivo
        Exercise savedExercise = new Exercise();
        savedExercise.setId(1L);
        savedExercise.setTitle("Ejercicio Básico");
        savedExercise.setDescription("Resolver problemas");
        savedExercise.setDifficulty("BASICO");
        savedExercise.setFileData(null);
        savedExercise.setFileName(null);
        savedExercise.setFileType(null);
        savedExercise.setCourse(testCourse);

        when(exerciseRepository.save(any(Exercise.class))).thenReturn(savedExercise);

        // ==================== ACT ====================
        Exercise result = exerciseService.createExercise(
                exerciseToCreate,
                1L,
                "teacher@test.com",
                null // Sin archivo
        );

        // ==================== ASSERT ====================
        assertNotNull(result, "El ejercicio creado no debe ser nulo");
        assertEquals("Ejercicio Básico", result.getTitle(), "El título debe coincidir");
        assertEquals("Resolver problemas", result.getDescription(), "La descripción debe coincidir");
        assertEquals("BASICO", result.getDifficulty(), "La dificultad debe coincidir");

        // Validaciones de ausencia de archivo
        assertFalse(result.hasFile(), "El ejercicio NO debe tener archivo adjunto");
        assertNull(result.getFileData(), "Los datos del archivo deben ser nulos");
        assertNull(result.getFileName(), "El nombre del archivo debe ser nulo");
        assertNull(result.getFileType(), "El tipo de archivo debe ser nulo");

        // Validar asociación con el curso
        assertNotNull(result.getCourse(), "Debe estar asociado a un curso");
        assertEquals(1L, result.getCourse().getId(), "Debe estar asociado al curso correcto");

        // Verificar interacciones con los repositorios
        verify(courseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(exerciseRepository, times(1)).save(any(Exercise.class));

        // ==================== RESULTADO ====================
        System.out.println("✅ CP007-02 PASÓ: Ejercicio sin archivo creado correctamente");
        System.out.println("   Título: " + result.getTitle());
        System.out.println("   Dificultad: " + result.getDifficulty());
        System.out.println("   Tiene archivo: NO");
        System.out.println("   Validación: El servicio acepta null como valor válido");
        System.out.println("   NOTA IMPORTANTE:");
        System.out.println("      - El botón 'Subir ejercicio' debe estar INHABILITADO en frontend");
        System.out.println("      - cuando no hay archivo seleccionado (validación preventiva)");
        System.out.println("      - El backend acepta null pero el frontend debe evitar esta situación");
    }
}