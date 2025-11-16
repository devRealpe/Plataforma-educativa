// ========================================
// StudentStatsDTO.java
// ========================================
package com.unimar.plataforma_educativa_angular.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsDTO {
    private Integer enrolledCourses;
    private Integer totalXP;
    private Integer completedExercises;
    private Integer completedChallenges;
}