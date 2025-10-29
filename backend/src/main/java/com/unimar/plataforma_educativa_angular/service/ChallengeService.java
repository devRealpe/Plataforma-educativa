package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public ChallengeService(
            ChallengeRepository challengeRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {
        this.challengeRepository = challengeRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Publicar reto (Profesor)
     */
    @Transactional
    public Challenge createChallenge(Challenge challenge, Long courseId, String teacherEmail, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para agregar retos a este curso");
        }

        // Validar bonificación
        if (challenge.getMaxBonusPoints() == null || challenge.getMaxBonusPoints() < 1
                || challenge.getMaxBonusPoints() > 10) {
            throw new RuntimeException("La bonificación debe estar entre 1 y 10 XP");
        }

        // Guardar archivo si existe
        if (file != null && !file.isEmpty()) {
            try {
                challenge.setFileData(file.getBytes());
                challenge.setFileName(file.getOriginalFilename());
                challenge.setFileType(file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
            }
        }

        challenge.setCourse(course);
        challenge.setActive(true);
        return challengeRepository.save(challenge);
    }

    /**
     * Obtener retos activos de un curso (Estudiantes y Profesor)
     */
    public List<Challenge> getActiveChallengesByCourse(Long courseId, String userEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isTeacher = course.getTeacher().getId().equals(user.getId());
        boolean isStudent = course.getStudents().contains(user);

        if (!isTeacher && !isStudent) {
            throw new RuntimeException("No tienes acceso a este curso");
        }

        // Estudiantes solo ven retos activos
        if (isStudent) {
            return challengeRepository.findByCourseIdAndActiveTrue(courseId);
        }

        // Profesores ven todos los retos
        return challengeRepository.findByCourseId(courseId);
    }

    /**
     * Obtener reto por ID
     */
    public Challenge getChallengeById(Long id, String userEmail) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reto no encontrado"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Course course = challenge.getCourse();
        boolean hasAccess = course.getTeacher().getId().equals(user.getId()) ||
                course.getStudents().contains(user);

        if (!hasAccess) {
            throw new RuntimeException("No tienes acceso a este reto");
        }

        // Estudiantes solo pueden ver retos activos
        if (!course.getTeacher().getId().equals(user.getId()) && !challenge.getActive()) {
            throw new RuntimeException("Este reto no está disponible");
        }

        return challenge;
    }

    /**
     * Editar reto (Profesor)
     */
    @Transactional
    public Challenge updateChallenge(Long id, Challenge challengeData, String teacherEmail, MultipartFile file) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reto no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!challenge.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para editar este reto");
        }

        // Validar bonificación
        if (challengeData.getMaxBonusPoints() != null) {
            if (challengeData.getMaxBonusPoints() < 1 || challengeData.getMaxBonusPoints() > 10) {
                throw new RuntimeException("La bonificación debe estar entre 1 y 10 XP");
            }
            challenge.setMaxBonusPoints(challengeData.getMaxBonusPoints());
        }

        challenge.setTitle(challengeData.getTitle());
        challenge.setDescription(challengeData.getDescription());
        challenge.setDifficulty(challengeData.getDifficulty());
        challenge.setDeadline(challengeData.getDeadline());

        if (challengeData.getActive() != null) {
            challenge.setActive(challengeData.getActive());
        }

        // Actualizar archivo si se proporciona
        if (file != null && !file.isEmpty()) {
            try {
                challenge.setFileData(file.getBytes());
                challenge.setFileName(file.getOriginalFilename());
                challenge.setFileType(file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo: " + e.getMessage());
            }
        }

        return challengeRepository.save(challenge);
    }

    /**
     * Eliminar reto (Profesor)
     */
    @Transactional
    public void deleteChallenge(Long id, String teacherEmail) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reto no encontrado"));

        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        if (!challenge.getCourse().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este reto");
        }

        challengeRepository.delete(challenge);
    }

    /**
     * Obtener archivo del reto
     */
    public byte[] getChallengeFile(Long id, String userEmail) {
        Challenge challenge = getChallengeById(id, userEmail);

        if (!challenge.hasFile()) {
            throw new RuntimeException("Este reto no tiene archivo adjunto");
        }

        return challenge.getFileData();
    }
}