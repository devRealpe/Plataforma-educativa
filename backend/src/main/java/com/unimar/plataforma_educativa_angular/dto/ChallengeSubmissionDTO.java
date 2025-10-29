package com.unimar.plataforma_educativa_angular.dto;

import com.unimar.plataforma_educativa_angular.entities.ChallengeSubmission;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ChallengeSubmissionDTO {
    private Long id;
    private Long challengeId;
    private String challengeTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String fileName;
    private String fileType;
    private LocalDateTime submittedAt;
    private String status;
    private Integer bonusPoints;
    private String feedback;
    private LocalDateTime reviewedAt;
    private boolean hasFile;
    private LocalDateTime lastModifiedAt;
    private Integer editCount;
    private Boolean canBeEdited;
    private Long daysUntilDeadline;
    private LocalDateTime challengeDeadline;

    public ChallengeSubmissionDTO(ChallengeSubmission submission) {
        this.id = submission.getId();
        this.challengeId = submission.getChallenge() != null ? submission.getChallenge().getId() : null;
        this.challengeTitle = submission.getChallenge() != null ? submission.getChallenge().getTitle() : null;
        this.studentId = submission.getStudent() != null ? submission.getStudent().getId() : null;
        this.studentName = submission.getStudent() != null ? submission.getStudent().getNombre() : null;
        this.studentEmail = submission.getStudent() != null ? submission.getStudent().getEmail() : null;
        this.fileName = submission.getFileName();
        this.fileType = submission.getFileType();
        this.submittedAt = submission.getSubmittedAt();
        this.status = submission.getStatus() != null ? submission.getStatus().name() : null;
        this.bonusPoints = submission.getBonusPoints();
        this.feedback = submission.getFeedback();
        this.reviewedAt = submission.getReviewedAt();
        this.hasFile = submission.hasFile();
        this.lastModifiedAt = submission.getLastModifiedAt();
        this.editCount = submission.getEditCount();
        this.canBeEdited = submission.canBeEdited();
        this.daysUntilDeadline = submission.getDaysUntilDeadline();
        this.challengeDeadline = submission.getChallenge() != null ? submission.getChallenge().getDeadline() : null;
    }
}