package com.unimar.plataforma_educativa_angular.dto;

import com.unimar.plataforma_educativa_angular.entities.StudentScore;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PodiumDTO {
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Integer totalBonusPoints;
    private Integer challengesCompleted;
    private Integer position;

    public PodiumDTO(StudentScore score, Integer position) {
        this.studentId = score.getStudent().getId();
        this.studentName = score.getStudent().getNombre();
        this.studentEmail = score.getStudent().getEmail();
        this.totalBonusPoints = score.getTotalBonusPoints();
        this.challengesCompleted = score.getChallengesCompleted();
        this.position = position;
    }
}