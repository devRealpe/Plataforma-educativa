// ========================================
// TeacherStatsDTO.java
// ========================================
package com.unimar.plataforma_educativa_angular.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherStatsDTO {
    private Integer totalCourses;
    private Integer totalStudents; // Sin duplicados
    private Integer totalExercises;
    private Integer totalChallenges;
    private Integer pendingSubmissions;
    private Integer pendingChallengeReviews;
}
