package com.unimar.plataforma_educativa_angular.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnoreProperties({ "hints", "submissions", "course", "hibernateLazyInitializer" })
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({ "password", "enrolledCourses", "hibernateLazyInitializer" })
    private User student;

    @Lob
    @Column(name = "file_data", columnDefinition = "LONGBLOB")
    private byte[] fileData;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    private Double grade;

    @Column(length = 1000)
    private String feedback;

    private LocalDateTime gradedAt;

    // Fecha de última modificación
    private LocalDateTime lastModifiedAt;

    // Contador de modificaciones
    @Column(nullable = false)
    private Integer editCount = 0;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }

    public enum SubmissionStatus {
        PENDING, // Sin calificar (visible para el profesor)
        GRADED, // Calificado
        REJECTED // Rechazado (opcional)
    }

    public boolean hasFile() {
        return fileData != null && fileData.length > 0;
    }

    // Método para verificar si puede ser editado
    public boolean canBeEdited() {
        // No puede ser editado si ya fue calificado
        if (status == SubmissionStatus.GRADED) {
            return false;
        }

        // Verificar si aún está dentro del plazo
        if (exercise != null && exercise.getDeadline() != null) {
            return LocalDateTime.now().isBefore(exercise.getDeadline());
        }

        // Si no hay deadline, puede ser editado siempre que no esté calificado
        return true;
    }

    // Método para obtener días restantes
    public Long getDaysUntilDeadline() {
        if (exercise == null || exercise.getDeadline() == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(exercise.getDeadline())) {
            return 0L;
        }

        return java.time.Duration.between(now, exercise.getDeadline()).toDays();
    }
}