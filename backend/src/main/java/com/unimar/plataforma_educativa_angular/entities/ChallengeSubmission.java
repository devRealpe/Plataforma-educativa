package com.unimar.plataforma_educativa_angular.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    @JsonIgnoreProperties({ "submissions", "course", "hibernateLazyInitializer" })
    private Challenge challenge;

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

    @Column(name = "bonus_points")
    private Integer bonusPoints; // Bonificación otorgada (0-10 XP)

    @Column(length = 1000)
    private String feedback;

    private LocalDateTime reviewedAt;

    private LocalDateTime lastModifiedAt;

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
        PENDING, // Sin revisar
        REVIEWED, // Revisado y bonificado
        REJECTED // Rechazado (sin bonificación)
    }

    public boolean hasFile() {
        return fileData != null && fileData.length > 0;
    }

    public boolean canBeEdited() {
        if (status == SubmissionStatus.REVIEWED || status == SubmissionStatus.REJECTED) {
            return false;
        }

        if (challenge != null && challenge.getDeadline() != null) {
            return LocalDateTime.now().isBefore(challenge.getDeadline());
        }

        return true;
    }

    public Long getDaysUntilDeadline() {
        if (challenge == null || challenge.getDeadline() == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(challenge.getDeadline())) {
            return 0L;
        }

        return java.time.Duration.between(now, challenge.getDeadline()).toDays();
    }
}