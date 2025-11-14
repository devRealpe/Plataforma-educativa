package com.unimar.plataforma_educativa_angular.dto;

import com.unimar.plataforma_educativa_angular.entities.Exercise;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ExerciseDTO {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private String externalUrl;
    private String fileName;
    private String fileType;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private Long courseId;
    private boolean hasFile;
    private boolean hasExternalUrl;
    private boolean hasResource;
    private String resourceType; // "FILE", "URL", "BOTH", "NONE"

    public ExerciseDTO(Exercise exercise) {
        this.id = exercise.getId();
        this.title = exercise.getTitle();
        this.description = exercise.getDescription();
        this.difficulty = exercise.getDifficulty();
        this.externalUrl = exercise.getExternalUrl();
        this.fileName = exercise.getFileName();
        this.fileType = exercise.getFileType();
        this.deadline = exercise.getDeadline();
        this.createdAt = exercise.getCreatedAt();
        this.courseId = exercise.getCourse() != null ? exercise.getCourse().getId() : null;
        this.hasFile = exercise.hasFile();
        this.hasExternalUrl = exercise.hasExternalUrl();
        this.hasResource = exercise.hasResource();
        this.resourceType = exercise.getResourceType();
    }
}