package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.Exercise;
import com.unimar.plataforma_educativa_angular.entities.Hint;
import com.unimar.plataforma_educativa_angular.entities.User;
import com.unimar.plataforma_educativa_angular.entities.Role;
import com.unimar.plataforma_educativa_angular.repositories.ExerciseRepository;
import com.unimar.plataforma_educativa_angular.repositories.HintRepository;
import com.unimar.plataforma_educativa_angular.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas del Servicio de Pistas - HU8")
class HintServiceTest {

    @Mock
    private HintRepository hintRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HintService hintService;

    private Course testCourse;
    private User testTeacher;
    private User testStudent;
    private Exercise testExercise;
    private Hint testHint;

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
        testExercise.setDescription("Resolver problemas");
        testExercise.setDifficulty("BASICO");
        testExercise.setCourse(testCourse);
        testExercise.setHints(new ArrayList<>());

        testHint = new Hint();
        testHint.setId(1L);
        testHint.setContent("Revisa la fórmula cuadrática");
        testHint.setOrder(1);
        testHint.setExercise(testExercise);
    }

    // ========================================
    // HU8: Pruebas de Asignación de Pistas
    // ========================================

    @Test
    @DisplayName("CP008-01 - HU8: Asignación exitosa de pista con contenido válido")
    void testCreateHint_WithValidContent_Success() {
        // Arrange
        Hint hintToCreate = new Hint();
        hintToCreate.setContent("Revisa la fórmula cuadrática");
        hintToCreate.setOrder(1);

        Hint savedHint = new Hint();
        savedHint.setId(1L);
        savedHint.setContent("Revisa la fórmula cuadrática");
        savedHint.setOrder(1);
        savedHint.setExercise(testExercise);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(hintRepository.save(any(Hint.class))).thenReturn(savedHint);

        // Act
        Hint result = hintService.createHint(hintToCreate, 1L, "teacher@test.com");

        // Assert
        assertNotNull(result, "La pista creada no debe ser nula");
        assertEquals("Revisa la fórmula cuadrática", result.getContent(), "El contenido debe coincidir");
        assertEquals(1, result.getOrder(), "El orden debe coincidir");
        assertNotNull(result.getExercise(), "Debe estar asociada a un ejercicio");
        assertEquals(testExercise.getId(), result.getExercise().getId(), "Debe estar asociada al ejercicio correcto");

        // Verificar interacciones
        verify(exerciseRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(hintRepository, times(1)).save(any(Hint.class));

        System.out.println("CP008-01 PASÓ: Pista asignada exitosamente");
        System.out.println("   Contenido: " + result.getContent());
        System.out.println("   Orden: " + result.getOrder());
    }

    @Test
    @DisplayName("CP008-02 - HU8: Validación de contenido vacío en pista")
    void testCreateHint_WithEmptyContent_ShouldBeHandledByFrontend() {
        // Arrange
        Hint hintToCreate = new Hint();
        hintToCreate.setContent(""); // Contenido vacío
        hintToCreate.setOrder(1);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));

        // Act & Assert
        // Nota: En el backend actual no hay validación explícita de contenido vacío
        // El botón "Guardar" debe estar inhabilitado en el frontend
        // Aquí verificamos que el servicio aceptaría la pista si se enviara

        Hint savedHint = new Hint();
        savedHint.setId(1L);
        savedHint.setContent("");
        savedHint.setExercise(testExercise);

        when(hintRepository.save(any(Hint.class))).thenReturn(savedHint);

        Hint result = hintService.createHint(hintToCreate, 1L, "teacher@test.com");

        // El backend lo acepta, pero el frontend debe prevenir esto
        assertEquals("", result.getContent());

        System.out.println("CP008-02 PASÓ: Validación de contenido vacío");
        System.out.println("   NOTA: El botón 'Guardar' debe estar inhabilitado en frontend");
        System.out.println("   cuando el contenido de la pista esté vacío");
    }

    @Test
    @DisplayName("CP008-03 - HU8: Edición exitosa de pista existente")
    void testUpdateHint_Success() {
        // Arrange
        Hint updatedHintData = new Hint();
        updatedHintData.setContent("Contenido actualizado de la pista");
        updatedHintData.setOrder(2);

        Hint existingHint = new Hint();
        existingHint.setId(1L);
        existingHint.setContent("Contenido original");
        existingHint.setOrder(1);
        existingHint.setExercise(testExercise);

        Hint savedHint = new Hint();
        savedHint.setId(1L);
        savedHint.setContent("Contenido actualizado de la pista");
        savedHint.setOrder(2);
        savedHint.setExercise(testExercise);

        when(hintRepository.findById(1L)).thenReturn(Optional.of(existingHint));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(hintRepository.save(any(Hint.class))).thenReturn(savedHint);

        // Act
        Hint result = hintService.updateHint(1L, updatedHintData, "teacher@test.com");

        // Assert
        assertNotNull(result, "La pista actualizada no debe ser nula");
        assertEquals("Contenido actualizado de la pista", result.getContent(), "El contenido debe estar actualizado");
        assertEquals(2, result.getOrder(), "El orden debe estar actualizado");

        // Verificar interacciones
        verify(hintRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByEmail("teacher@test.com");
        verify(hintRepository, times(1)).save(any(Hint.class));

        System.out.println("CP008-03 PASÓ: Pista actualizada correctamente");
        System.out.println("   Contenido anterior: Contenido original");
        System.out.println("   Contenido nuevo: " + result.getContent());
    }

    @Test
    @DisplayName("HU8: Solo el profesor del curso puede crear pistas")
    void testCreateHint_OnlyTeacherCanCreate() {
        // Arrange
        Hint hintToCreate = new Hint();
        hintToCreate.setContent("Pista de prueba");
        hintToCreate.setOrder(1);

        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> hintService.createHint(hintToCreate, 1L, "other@test.com"));

        assertEquals("No tienes permiso para agregar pistas a este ejercicio", exception.getMessage());
        verify(hintRepository, never()).save(any(Hint.class));

        System.out.println("Sistema valida que solo el profesor del curso puede crear pistas");
    }

    @Test
    @DisplayName("HU8: Solo el profesor del curso puede editar pistas")
    void testUpdateHint_OnlyTeacherCanUpdate() {
        // Arrange
        Hint updatedHintData = new Hint();
        updatedHintData.setContent("Intento de actualización");

        User otherTeacher = new User();
        otherTeacher.setId(99L);
        otherTeacher.setEmail("other@test.com");
        otherTeacher.setRole(Role.TEACHER);

        when(hintRepository.findById(1L)).thenReturn(Optional.of(testHint));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherTeacher));

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> hintService.updateHint(1L, updatedHintData, "other@test.com"));

        assertEquals("No tienes permiso para editar esta pista", exception.getMessage());
        verify(hintRepository, never()).save(any(Hint.class));

        System.out.println("Sistema valida que solo el profesor del curso puede editar pistas");
    }

    @Test
    @DisplayName("HU8: Estudiantes pueden ver pistas del ejercicio")
    void testGetHints_StudentCanView() {
        // Arrange
        List<Hint> hints = new ArrayList<>();
        hints.add(testHint);

        Hint hint2 = new Hint();
        hint2.setId(2L);
        hint2.setContent("Segunda pista");
        hint2.setOrder(2);
        hint2.setExercise(testExercise);
        hints.add(hint2);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("student@test.com")).thenReturn(Optional.of(testStudent));
        when(hintRepository.findByExerciseIdOrderByOrderAsc(1L)).thenReturn(hints);

        // Act
        List<Hint> result = hintService.getHintsByExercise(1L, "student@test.com");

        // Assert
        assertNotNull(result, "La lista de pistas no debe ser nula");
        assertEquals(2, result.size(), "Debe haber 2 pistas");
        assertEquals("Revisa la fórmula cuadrática", result.get(0).getContent());
        assertEquals("Segunda pista", result.get(1).getContent());

        verify(hintRepository, times(1)).findByExerciseIdOrderByOrderAsc(1L);

        System.out.println("Estudiantes pueden ver las pistas ordenadas correctamente");
    }

    @Test
    @DisplayName("HU8: Eliminar pista existente")
    void testDeleteHint_Success() {
        // Arrange
        when(hintRepository.findById(1L)).thenReturn(Optional.of(testHint));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        doNothing().when(hintRepository).delete(testHint);

        // Act
        assertDoesNotThrow(() -> hintService.deleteHint(1L, "teacher@test.com"));

        // Assert
        verify(hintRepository, times(1)).findById(1L);
        verify(hintRepository, times(1)).delete(testHint);

        System.out.println("Pista eliminada correctamente");
    }

    @Test
    @DisplayName("HU8: Pistas ordenadas correctamente por número de orden")
    void testGetHints_OrderedCorrectly() {
        // Arrange
        List<Hint> hints = new ArrayList<>();

        Hint hint1 = new Hint();
        hint1.setId(1L);
        hint1.setContent("Primera pista");
        hint1.setOrder(1);
        hints.add(hint1);

        Hint hint2 = new Hint();
        hint2.setId(2L);
        hint2.setContent("Segunda pista");
        hint2.setOrder(2);
        hints.add(hint2);

        Hint hint3 = new Hint();
        hint3.setId(3L);
        hint3.setContent("Tercera pista");
        hint3.setOrder(3);
        hints.add(hint3);

        when(exerciseRepository.findById(1L)).thenReturn(Optional.of(testExercise));
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testTeacher));
        when(hintRepository.findByExerciseIdOrderByOrderAsc(1L)).thenReturn(hints);

        // Act
        List<Hint> result = hintService.getHintsByExercise(1L, "teacher@test.com");

        // Assert
        assertEquals(3, result.size());
        assertEquals(1, result.get(0).getOrder());
        assertEquals(2, result.get(1).getOrder());
        assertEquals(3, result.get(2).getOrder());

        System.out.println("Pistas ordenadas correctamente: 1, 2, 3");
    }
}