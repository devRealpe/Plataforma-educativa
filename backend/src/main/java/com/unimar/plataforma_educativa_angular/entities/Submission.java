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

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnoreProperties({ "hints", "submissions", "course" })
    private Exercise exercise;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({ "password", "enrolledCourses" })
    private User student;

    private String filePath; // Ruta del archivo subido

    private String fileName; // Nombre original del archivo

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    private Integer grade; // Calificación de 0 a 100

    @Column(length = 1000)
    private String feedback; // Retroalimentación del profesor

    private LocalDateTime gradedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    public enum SubmissionStatus {
        PENDING, // Pendiente de revisión
        GRADED, // Calificado
        REJECTED // Rechazado
    }
}