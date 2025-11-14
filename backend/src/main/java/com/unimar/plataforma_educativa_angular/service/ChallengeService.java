package com.unimar.plataforma_educativa_angular.service;

import com.unimar.plataforma_educativa_angular.entities.*;
import com.unimar.plataforma_educativa_angular.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
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

    private void validateUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return; // URL opcional
        }

        String urlTrimmed = url.trim();

        // Validar que sea una URL válida
        try {
            new URL(urlTrimmed);
        } catch (MalformedURLException e) {
            throw new RuntimeException("La URL proporcionada no es válida: " + urlTrimmed);
        }

        // Validar longitud
        if (urlTrimmed.length() > 500) {
            throw new RuntimeException("La URL es demasiado larga (máximo 500 caracteres)");
        }

        // Validar que comience con http:// o https://
        if (!urlTrimmed.startsWith("http://") && !urlTrimmed.startsWith("https://")) {
            throw new RuntimeException("La URL debe comenzar con http:// o https://");
        }
    }

    @Transactional
    public Challenge createChallenge(Challenge challenge, Long courseId, String teacherEmail,
            MultipartFile file, String externalUrl) {
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

        if (externalUrl != null && !externalUrl.trim().isEmpty()) {
            validateUrl(externalUrl);
            challenge.setExternalUrl(externalUrl.trim());
            System.out.println("✅ URL externa guardada: " + externalUrl.trim());
        }

        // Guardar archivo si existe
        if (file != null && !file.isEmpty()) {
            try {
                challenge.setFileData(file.getBytes());
                challenge.setFileName(file.getOriginalFilename());
                challenge.setFileType(file.getContentType());
                System.out.println("✅ Archivo guardado: " + file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar el archivo: " + e.getMessage());
            }
        }

        if (!challenge.hasFile() && !challenge.hasExternalUrl()) {
            System.out.println("⚠️ Advertencia: Reto sin recursos (archivo o URL)");
            // Nota: Esto es válido, algunos retos pueden ser solo descripción
        }

        challenge.setCourse(course);
        challenge.setActive(true);
        Challenge saved = challengeRepository.save(challenge);

        System.out.println("🏆 Reto creado exitosamente:");
        System.out.println("   • ID: " + saved.getId());
        System.out.println("   • Título: " + saved.getTitle());
        System.out.println("   • Tiene archivo: " + saved.hasFile());
        System.out.println("   • Tiene URL: " + saved.hasExternalUrl());
        System.out.println("   • Tipo de recurso: " + saved.getResourceType());

        return saved;
    }

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

    @Transactional
    public Challenge updateChallenge(Long id, Challenge challengeData, String teacherEmail,
            MultipartFile file, String externalUrl) {
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

        if (externalUrl != null) {
            if (externalUrl.trim().isEmpty()) {
                // Si se envía vacío, eliminar la URL
                challenge.setExternalUrl(null);
                System.out.println("🗑️ URL externa eliminada");
            } else {
                // Si se envía una URL, validarla y guardarla
                validateUrl(externalUrl);
                challenge.setExternalUrl(externalUrl.trim());
                System.out.println("✅ URL externa actualizada: " + externalUrl.trim());
            }
        }

        // Actualizar archivo si se proporciona
        if (file != null && !file.isEmpty()) {
            try {
                challenge.setFileData(file.getBytes());
                challenge.setFileName(file.getOriginalFilename());
                challenge.setFileType(file.getContentType());
                System.out.println("✅ Archivo actualizado: " + file.getOriginalFilename());
            } catch (IOException e) {
                throw new RuntimeException("Error al actualizar el archivo: " + e.getMessage());
            }
        }

        Challenge updated = challengeRepository.save(challenge);

        System.out.println("🏆 Reto actualizado exitosamente:");
        System.out.println("   • ID: " + updated.getId());
        System.out.println("   • Título: " + updated.getTitle());
        System.out.println("   • Tiene archivo: " + updated.hasFile());
        System.out.println("   • Tiene URL: " + updated.hasExternalUrl());
        System.out.println("   • Tipo de recurso: " + updated.getResourceType());

        return updated;
    }

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

    public byte[] getChallengeFile(Long id, String userEmail) {
        Challenge challenge = getChallengeById(id, userEmail);

        if (!challenge.hasFile()) {
            throw new RuntimeException("Este reto no tiene archivo adjunto");
        }

        return challenge.getFileData();
    }
}