package com.unimar.plataforma_educativa_angular.dto;

import com.unimar.plataforma_educativa_angular.entities.Submission;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class SubmissionDTO {
    private Long id;
    private Long exerciseId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String fileName;
    private String fileType;
    private LocalDateTime submittedAt;
    private String status;
    private Double grade;
    private String feedback;
    private LocalDateTime gradedAt;
    private boolean hasFile;

    public SubmissionDTO(Submission submission) {
        this.id = submission.getId();
        this.exerciseId = submission.getExercise() != null ? submission.getExercise().getId() : null;
        this.studentId = submission.getStudent() != null ? submission.getStudent().getId() : null;
        this.studentName = submission.getStudent() != null ? submission.getStudent().getNombre() : null;
        this.studentEmail = submission.getStudent() != null ? submission.getStudent().getEmail() : null;
        this.fileName = submission.getFileName();
        this.fileType = submission.getFileType();
        this.submittedAt = submission.getSubmittedAt();
        this.status = submission.getStatus() != null ? submission.getStatus().name() : null;
        this.grade = submission.getGrade();
        this.feedback = submission.getFeedback();
        this.gradedAt = submission.getGradedAt();
        this.hasFile = submission.hasFile();
    }
}
