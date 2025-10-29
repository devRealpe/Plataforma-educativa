package com.unimar.plataforma_educativa_angular.dto;

import com.unimar.plataforma_educativa_angular.entities.Challenge;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ChallengeDTO {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private Integer maxBonusPoints;
    private String fileName;
    private String fileType;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private Boolean active;
    private Long courseId;
    private boolean hasFile;
    private Integer submissionsCount;

    public ChallengeDTO(Challenge challenge) {
        this.id = challenge.getId();
        this.title = challenge.getTitle();
        this.description = challenge.getDescription();
        this.difficulty = challenge.getDifficulty();
        this.maxBonusPoints = challenge.getMaxBonusPoints();
        this.fileName = challenge.getFileName();
        this.fileType = challenge.getFileType();
        this.deadline = challenge.getDeadline();
        this.createdAt = challenge.getCreatedAt();
        this.active = challenge.getActive();
        this.courseId = challenge.getCourse() != null ? challenge.getCourse().getId() : null;
        this.hasFile = challenge.hasFile();
        this.submissionsCount = challenge.getSubmissions() != null ? challenge.getSubmissions().size() : 0;
    }
}