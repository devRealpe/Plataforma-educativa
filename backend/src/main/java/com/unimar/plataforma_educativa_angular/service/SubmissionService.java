package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            ExerciseRepository exerciseRepository,
            UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Subir entrega (Estudiante)
     * 🔥 Ahora guarda el archivo en la base de datos como BLOB
     */
    @Transactional
    public Submission submitExercise(Long exerciseId, String studentEmail, MultipartFile file) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        // Verificar que el estudiante está inscrito en el curso
        if (!exercise.getCourse().getStudents().contains(student)) {
            throw new RuntimeException("No estás inscrito en este curso");
        }

        // Verificar que no haya entregado anteriormente
        if (submissionRepository.existsByExerciseIdAndStudentId(exerciseId, student.getId())) {
            throw new RuntimeException("Ya has entregado este ejercicio");
        }

        // Verificar fecha límite
        if (exercise.getDeadline() != null && LocalDateTime.now().isAfter(exercise.getDeadline())) {
            throw new RuntimeException("La fecha límite de entrega ha pasado");
        }

        // 🔥 Guardar archivo en base de datos
        Submission submission = new Submission();
        submission.setExercise(exercise);
        submission.setStudent(student);

        try {
            submission.setFileData(file.getBytes());
            submission.setFileName(file.getOriginalFilename());
            submission.setFileType(file.getContentType());
        } catch (IOException e) {
            throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
        }

        submission.setStatus(Submission.SubmissionStatus.PENDING);

        return submissionRepository.save(submission);
    }

    /**
     * Obtener entregas de un ejercicio (Profesor)
     */
    public List<Submission> getSubmissionsByExercise(Long exerciseId, String teacherEmail) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Verificar que es el profesor del curso
        if (!exercise.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para ver estas entregas");
        }

        return submissionRepository.findByExerciseId(exerciseId);
    }

    /**
     * Obtener mis entregas (Estudiante)
     */
    public List<Submission> getMySubmissions(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        return submissionRepository.findByStudentId(student.getId());
    }

    /**
     * Obtener una entrega específica
     */
    public Submission getSubmissionById(Long id, String userEmail) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar permisos: profesor del curso o el estudiante que entregó
        boolean isTeacher = submission.getExercise().getCourse().getTeacher().getId().equals(user.getId());
        boolean isOwner = submission.getStudent().getId().equals(user.getId());

        if (!isTeacher && !isOwner) {
            throw new RuntimeException("No tienes permiso para ver esta entrega");
        }

        return submission;
    }

    /**
     * Calificar entrega (Profesor)
     */
    @Transactional
    public Submission gradeSubmission(Long id, Integer grade, String feedback, String teacherEmail) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        // Verificar que es el profesor del curso
        if (!submission.getExercise().getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para calificar esta entrega");
        }

        // Validar calificación
        if (grade < 0 || grade > 100) {
            throw new RuntimeException("La calificación debe estar entre 0 y 100");
        }

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setStatus(Submission.SubmissionStatus.GRADED);
        submission.setGradedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    /**
     * 🔥 NUEVO: Obtener archivo de entrega desde la base de datos
     */
    public byte[] getSubmissionFile(Long id, String userEmail) {
        Submission submission = getSubmissionById(id, userEmail);

        if (!submission.hasFile()) {
            throw new RuntimeException("Esta entrega no tiene archivo adjunto");
        }

        return submission.getFileData();
    }

    /**
     * Eliminar entrega (Solo antes de ser calificada)
     */
    @Transactional
    public void deleteSubmission(Long id, String studentEmail) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        // Verificar que es el dueño de la entrega
        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("No puedes eliminar esta entrega");
        }

        // No permitir eliminar si ya fue calificada
        if (submission.getStatus() == Submission.SubmissionStatus.GRADED) {
            throw new RuntimeException("No puedes eliminar una entrega que ya fue calificada");
        }

        submissionRepository.delete(submission);
    }
}