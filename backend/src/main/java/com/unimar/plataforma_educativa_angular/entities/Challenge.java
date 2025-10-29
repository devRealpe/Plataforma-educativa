package com.unimar.plataforma_educativa_angular.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String difficulty; // BASICO, INTERMEDIO, AVANZADO

    @Column(nullable = false)
    private Integer maxBonusPoints; // Bonificación máxima (1-10 XP)

    @Lob
    @Column(name = "file_data", columnDefinition = "LONGBLOB")
    private byte[] fileData;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    private LocalDateTime deadline;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean active = true; // Para "publicar" o "despublicar"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({ "challenges", "students", "teacher", "hibernateLazyInitializer" })
    private Course course;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({ "challenge", "hibernateLazyInitializer" })
    private List<ChallengeSubmission> submissions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean hasFile() {
        return fileData != null && fileData.length > 0;
    }

    // Validación de bonificación
    public void setMaxBonusPoints(Integer points) {
        if (points < 1 || points > 10) {
            throw new IllegalArgumentException("La bonificación debe estar entre 1 y 10 XP");
        }
        this.maxBonusPoints = points;
    }
}