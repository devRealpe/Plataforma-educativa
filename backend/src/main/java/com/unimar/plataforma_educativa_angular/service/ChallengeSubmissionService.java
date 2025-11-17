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

    @Transactional
    public ChallengeSubmission reviewSubmission(Long id, Integer bonusPoints, String feedback, String teacherEmail) {
        System.out.println("\n========================================");
        System.out.println("🔍 REVISANDO SOLUCIÓN DE RETO");
        System.out.println("========================================");
        System.out.println("   Submission ID: " + id);
        System.out.println("   Bonificación nueva: " + bonusPoints + " XP");
        System.out.println("   Profesor: " + teacherEmail);
        System.out.println("   Feedback: " + feedback);

        ChallengeSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solución no encontrada"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!submission.getChallenge().getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para revisar esta solución");
        }

        int maxBonus = submission.getChallenge().getMaxBonusPoints();
        if (bonusPoints < 0 || bonusPoints > maxBonus) {
            throw new RuntimeException("La bonificación debe estar entre 0 y " + maxBonus + " XP");
        }

        System.out.println("   ✅ Validaciones superadas");
        System.out.println("   📝 Estudiante: " + submission.getStudent().getNombre());
        System.out.println("   📚 Curso: " + submission.getChallenge().getCourse().getTitle());

        // ✅ VERIFICAR: ¿El estudiante sigue inscrito en el curso?
        Course course = submission.getChallenge().getCourse();
        User student = submission.getStudent();

        // Refrescar la relación de estudiantes
        course = challengeRepository.findById(submission.getChallenge().getId())
                .orElseThrow(() -> new RuntimeException("Reto no encontrado"))
                .getCourse();

        boolean isEnrolled = course.getStudents().stream()
                .anyMatch(s -> s.getId().equals(student.getId()));

        System.out.println("   📋 ¿Estudiante inscrito en el curso?: " + (isEnrolled ? "SÍ" : "NO"));

        if (!isEnrolled) {
            System.out.println("   ⚠️ ADVERTENCIA: Estudiante NO está inscrito en el curso");
            System.out.println("   ℹ️ Se guardará la calificación pero NO se actualizará el podio");
        }

        Integer previousBonusPoints = submission.getBonusPoints();
        boolean isRecalification = (previousBonusPoints != null &&
                submission.getStatus() == ChallengeSubmission.SubmissionStatus.REVIEWED);

        int previousPoints = (previousBonusPoints != null) ? previousBonusPoints : 0;

        System.out.println("\n   🔄 Tipo de revisión:");
        System.out.println("      • Es re-calificación: " + isRecalification);
        if (isRecalification) {
            System.out.println("      • Puntos anteriores: " + previousPoints + " XP");
            System.out.println("      • Puntos nuevos: " + bonusPoints + " XP");
            System.out.println("      • Diferencia: " + (bonusPoints - previousPoints) + " XP");
        }

        submission.setBonusPoints(bonusPoints);
        submission.setFeedback(feedback);
        submission.setStatus(bonusPoints > 0
                ? ChallengeSubmission.SubmissionStatus.REVIEWED
                : ChallengeSubmission.SubmissionStatus.REJECTED);
        submission.setReviewedAt(LocalDateTime.now());

        ChallengeSubmission savedSubmission = submissionRepository.save(submission);
        System.out.println("   💾 Solución guardada en BD");

        // ✅ NUEVO: Solo actualizar podio si está inscrito
        if (isEnrolled) {
            System.out.println("\n   📊 Actualizando student_scores...");
            if (isRecalification) {
                updateStudentScoreRecalification(student, course, previousPoints, bonusPoints);
            } else {
                updateStudentScore(student, course, bonusPoints, bonusPoints > 0);
            }
            System.out.println("   ✅ student_scores actualizado correctamente");
        } else {
            System.out.println("\n   ⏭️ Omitiendo actualización de student_scores (estudiante no inscrito)");
        }

        System.out.println("========================================");
        System.out.println("✅ REVISIÓN COMPLETADA EXITOSAMENTE");
        System.out.println("========================================\n");

        return savedSubmission;
    }

    private void updateStudentScoreRecalification(User student, Course course,
            int previousPoints, int newPoints) {
        System.out.println("\n      ═══════════════════════════════════");
        System.out.println("      🔄 ACTUALIZANDO PUNTUACIÓN (RE-CALIFICACIÓN)");
        System.out.println("      ═══════════════════════════════════");
        System.out.println("         🎓 Estudiante: " + student.getNombre() + " (ID: " + student.getId() + ")");
        System.out.println("         📚 Curso: " + course.getTitle() + " (ID: " + course.getId() + ")");
        System.out.println("         📉 Puntos anteriores: " + previousPoints + " XP");
        System.out.println("         📈 Puntos nuevos: " + newPoints + " XP");

        StudentScore score = studentScoreRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(null);

        if (score == null) {
            System.out.println("\n      ⚠️ ADVERTENCIA: No existe registro previo");
            System.out.println("         Creando nuevo registro con puntos: " + newPoints + " XP");
            score = new StudentScore();
            score.setStudent(student);
            score.setCourse(course);
            score.setTotalBonusPoints(newPoints);
            score.setChallengesCompleted(newPoints > 0 ? 1 : 0);
        } else {
            System.out.println("\n      📋 REGISTRO EXISTENTE:");
            System.out.println("         • Puntos actuales: " + score.getTotalBonusPoints() + " XP");
            System.out.println("         • Retos completados: " + score.getChallengesCompleted());

            int updatedPoints = score.getTotalBonusPoints() - previousPoints + newPoints;
            score.setTotalBonusPoints(Math.max(0, updatedPoints));

            if (previousPoints > 0 && newPoints == 0) {
                score.setChallengesCompleted(Math.max(0, score.getChallengesCompleted() - 1));
            } else if (previousPoints == 0 && newPoints > 0) {
                score.setChallengesCompleted(score.getChallengesCompleted() + 1);
            }

            System.out.println("\n      📊 CÁLCULO:");
            System.out.println("         " + (score.getTotalBonusPoints() + previousPoints) +
                    " - " + previousPoints + " + " + newPoints + " = " + score.getTotalBonusPoints());
        }

        studentScoreRepository.save(score);
        System.out.println("\n      💾 GUARDADO EN BASE DE DATOS:");
        System.out.println("         • Puntos finales: " + score.getTotalBonusPoints() + " XP");
        System.out.println("         • Retos completados: " + score.getChallengesCompleted());
        System.out.println("      ═══════════════════════════════════");
        System.out.println("      ✅ RE-CALIFICACIÓN COMPLETADA");
        System.out.println("      ═══════════════════════════════════\n");
    }

    private void updateStudentScore(User student, Course course, Integer bonusPoints, boolean incrementChallenges) {
        System.out.println("\n      ═══════════════════════════════════");
        System.out.println("      📊 ACTUALIZANDO STUDENT_SCORES (PRIMERA VEZ)");
        System.out.println("      ═══════════════════════════════════");
        System.out.println("         🎓 Estudiante: " + student.getNombre() + " (ID: " + student.getId() + ")");
        System.out.println("         📚 Curso: " + course.getTitle() + " (ID: " + course.getId() + ")");
        System.out.println("         💎 Bonificación: " + bonusPoints + " XP");
        System.out.println("         🏆 Incrementar retos: " + incrementChallenges);

        StudentScore score = studentScoreRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElse(null);

        if (score == null) {
            System.out.println("\n      🆕 REGISTRO NO ENCONTRADO - Creando nuevo...");
            score = new StudentScore();
            score.setStudent(student);
            score.setCourse(course);
            score.setTotalBonusPoints(0);
            score.setChallengesCompleted(0);
            System.out.println("         ✅ Nuevo registro creado");
        } else {
            System.out.println("\n      📋 REGISTRO EXISTENTE ENCONTRADO:");
            System.out.println("         • Puntos actuales: " + score.getTotalBonusPoints() + " XP");
            System.out.println("         • Retos completados: " + score.getChallengesCompleted());
        }

        int previousPoints = score.getTotalBonusPoints();
        int previousChallenges = score.getChallengesCompleted();

        score.setTotalBonusPoints(previousPoints + bonusPoints);

        if (incrementChallenges) {
            score.setChallengesCompleted(previousChallenges + 1);
        }

        studentScoreRepository.save(score);
        System.out.println("\n      💾 GUARDADO EN BASE DE DATOS:");
        System.out.println("         • Puntos anteriores: " + previousPoints + " XP");
        System.out.println("         • Puntos nuevos: " + score.getTotalBonusPoints() + " XP");
        System.out.println("         • Retos anteriores: " + previousChallenges);
        System.out.println("         • Retos nuevos: " + score.getChallengesCompleted());
        System.out.println("      ═══════════════════════════════════");
        System.out.println("      ✅ ACTUALIZACIÓN COMPLETADA");
        System.out.println("      ═══════════════════════════════════\n");
    }

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