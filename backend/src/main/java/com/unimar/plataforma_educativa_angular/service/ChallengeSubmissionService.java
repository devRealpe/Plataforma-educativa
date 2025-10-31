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
public class ChallengeSubmissionService {

    private final ChallengeSubmissionRepository submissionRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final StudentScoreRepository studentScoreRepository;

    public ChallengeSubmissionService(
            ChallengeSubmissionRepository submissionRepository,
            ChallengeRepository challengeRepository,
            UserRepository userRepository,
            StudentScoreRepository studentScoreRepository) {
        this.submissionRepository = submissionRepository;
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.studentScoreRepository = studentScoreRepository;
    }

    /**
     * Revisar y otorgar bonificación (Profesor)
     * ✅ CORRECCIÓN: Asegura que se actualice student_scores correctamente
     */
    @Transactional
    public ChallengeSubmission reviewSubmission(Long id, Integer bonusPoints, String feedback, String teacherEmail) {
        System.out.println("🔍 Revisando solución de reto: " + id);
        System.out.println("   Bonificación: " + bonusPoints + " XP");
        System.out.println("   Profesor: " + teacherEmail);

        ChallengeSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solución no encontrada"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!submission.getChallenge().getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para revisar esta solución");
        }

        // Validar bonificación
        int maxBonus = submission.getChallenge().getMaxBonusPoints();
        if (bonusPoints < 0 || bonusPoints > maxBonus) {
            throw new RuntimeException("La bonificación debe estar entre 0 y " + maxBonus + " XP");
        }

        // Actualizar la solución
        submission.setBonusPoints(bonusPoints);
        submission.setFeedback(feedback);
        submission.setStatus(bonusPoints > 0 ? ChallengeSubmission.SubmissionStatus.REVIEWED
                : ChallengeSubmission.SubmissionStatus.REJECTED);
        submission.setReviewedAt(LocalDateTime.now());

        ChallengeSubmission savedSubmission = submissionRepository.save(submission);
        System.out.println("   ✅ Solución guardada en BD");

        // ✅ CRÍTICO: Actualizar puntuación del estudiante si recibió bonificación
        if (bonusPoints > 0) {
            System.out.println("   💎 Actualizando puntuación del estudiante...");
            updateStudentScore(submission.getStudent(), submission.getChallenge().getCourse(), bonusPoints);
            System.out.println("   ✅ Puntuación actualizada correctamente");
        } else {
            System.out.println("   ⚠️ No se otorgó bonificación (0 XP)");
        }

        return savedSubmission;
    }

    /**
     * ✅ CORRECCIÓN: Método mejorado para actualizar puntuación del estudiante
     */
    private void updateStudentScore(User student, Course course, Integer bonusPoints) {
        System.out.println("      📊 Buscando registro de puntuación...");
        System.out.println("         Estudiante ID: " + student.getId());
        System.out.println("         Curso ID: " + course.getId());

        StudentScore score = studentScoreRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(null);

        if (score == null) {
            System.out.println("      🆕 Registro no encontrado. Creando nuevo registro...");
            score = new StudentScore();
            score.setStudent(student);
            score.setCourse(course);
            score.setTotalBonusPoints(0);
            score.setChallengesCompleted(0);
        } else {
            System.out.println("      ✅ Registro encontrado. Actualizando...");
            System.out.println("         Puntos actuales: " + score.getTotalBonusPoints() + " XP");
            System.out.println("         Retos completados: " + score.getChallengesCompleted());
        }

        // Actualizar puntuación
        score.addBonusPoints(bonusPoints);
        studentScoreRepository.save(score);

        System.out.println("      💾 Registro guardado en student_scores");
        System.out.println("         Nuevos puntos totales: " + score.getTotalBonusPoints() + " XP");
        System.out.println("         Nuevos retos completados: " + score.getChallengesCompleted());
    }

    // ... resto de métodos sin cambios

    @Transactional
    public ChallengeSubmission submitChallenge(Long challengeId, String studentEmail, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Debes seleccionar un archivo para subir la solución");
        }

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Reto no encontrado"));

        if (!challenge.getActive()) {
            throw new RuntimeException("Este reto no está activo");
        }

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!challenge.getCourse().getStudents().contains(student)) {
            throw new RuntimeException("No estás inscrito en este curso");
        }

        if (submissionRepository.existsByChallengeIdAndStudentId(challengeId, student.getId())) {
            throw new RuntimeException(
                    "Ya has enviado una solución para este reto. Usa la opción 'Editar' para actualizarlo");
        }

        if (challenge.getDeadline() != null && LocalDateTime.now().isAfter(challenge.getDeadline())) {
            throw new RuntimeException("La fecha límite de entrega ha pasado");
        }

        ChallengeSubmission submission = new ChallengeSubmission();
        submission.setChallenge(challenge);
        submission.setStudent(student);
        submission.setStatus(ChallengeSubmission.SubmissionStatus.PENDING);
        submission.setEditCount(0);

        try {
            submission.setFileData(file.getBytes());
            submission.setFileName(file.getOriginalFilename());
            submission.setFileType(file.getContentType());
        } catch (IOException e) {
            throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
        }

        return submissionRepository.save(submission);
    }

    @Transactional
    public ChallengeSubmission updateSubmission(Long submissionId, String studentEmail, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Debes seleccionar un archivo para actualizar la solución");
        }

        ChallengeSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Solución no encontrada"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("No puedes editar esta solución");
        }

        if (!submission.canBeEdited()) {
            if (submission.getStatus() == ChallengeSubmission.SubmissionStatus.REVIEWED) {
                throw new RuntimeException("No puedes editar una solución que ya fue revisada");
            }

            if (submission.getChallenge().getDeadline() != null &&
                    LocalDateTime.now().isAfter(submission.getChallenge().getDeadline())) {
                throw new RuntimeException("La fecha límite de entrega ha pasado. Ya no puedes editar tu solución.");
            }
        }

        try {
            submission.setFileData(file.getBytes());
            submission.setFileName(file.getOriginalFilename());
            submission.setFileType(file.getContentType());
            submission.setEditCount(submission.getEditCount() + 1);
            submission.setLastModifiedAt(LocalDateTime.now());
        } catch (IOException e) {
            throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
        }

        return submissionRepository.save(submission);
    }

    public List<ChallengeSubmission> getSubmissionsByChallenge(Long challengeId, String teacherEmail) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Reto no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!challenge.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para ver estas soluciones");
        }

        return submissionRepository.findByChallengeId(challengeId);
    }

    public List<ChallengeSubmission> getMySubmissions(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        return submissionRepository.findByStudentId(student.getId());
    }

    public ChallengeSubmission getSubmissionById(Long id, String userEmail) {
        ChallengeSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solución no encontrada"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isTeacher = submission.getChallenge().getCourse().getTeacher().getId().equals(user.getId());
        boolean isOwner = submission.getStudent().getId().equals(user.getId());

        if (!isTeacher && !isOwner) {
            throw new RuntimeException("No tienes permiso para ver esta solución");
        }

        return submission;
    }

    public byte[] getSubmissionFile(Long id, String userEmail) {
        ChallengeSubmission submission = getSubmissionById(id, userEmail);

        if (!submission.hasFile()) {
            throw new RuntimeException("Esta solución no tiene archivo adjunto");
        }

        return submission.getFileData();
    }

    @Transactional
    public void deleteSubmission(Long id, String studentEmail) {
        ChallengeSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solución no encontrada"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));

        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("No puedes eliminar esta solución");
        }

        if (submission.getStatus() == ChallengeSubmission.SubmissionStatus.REVIEWED) {
            throw new RuntimeException("No puedes eliminar una solución que ya fue revisada");
        }

        submissionRepository.delete(submission);
    }
}