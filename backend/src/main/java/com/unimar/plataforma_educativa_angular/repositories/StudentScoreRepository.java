package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.StudentScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentScoreRepository extends JpaRepository<StudentScore, Long> {

    Optional<StudentScore> findByStudentIdAndCourseId(Long studentId, Long courseId);

    List<StudentScore> findByCourseId(Long courseId);

    @Query("SELECT s FROM StudentScore s WHERE s.course.id = :courseId ORDER BY s.totalBonusPoints DESC, s.challengesCompleted DESC")
    List<StudentScore> findTopStudentsByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT s FROM StudentScore s WHERE s.course.id = :courseId AND s.course.level = :level ORDER BY s.totalBonusPoints DESC")
    List<StudentScore> findTopStudentsByCourseIdAndLevel(@Param("courseId") Long courseId,
            @Param("level") String level);
}