package com.unimar.plataforma_educativa_angular.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_scores", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "course_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({ "password", "enrolledCourses", "hibernateLazyInitializer" })
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({ "students", "teacher", "hibernateLazyInitializer" })
    private Course course;

    @Column(nullable = false)
    private Integer totalBonusPoints = 0; // Total de XP acumulados

    @Column(nullable = false)
    private Integer challengesCompleted = 0; // Retos completados

    // Método para agregar bonificación
    public void addBonusPoints(Integer points) {
        if (points > 0) {
            this.totalBonusPoints += points;
            this.challengesCompleted += 1;
        }
    }
}