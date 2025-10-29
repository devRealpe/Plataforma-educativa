package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Challenge;
import com.unimar.plataforma_educativa_angular.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    List<Challenge> findByCourse(Course course);

    List<Challenge> findByCourseId(Long courseId);

    List<Challenge> findByCourseIdAndActiveTrue(Long courseId);

    List<Challenge> findByDifficulty(String difficulty);

    List<Challenge> findByCourseIdAndDifficulty(Long courseId, String difficulty);

    long countByCourseId(Long courseId);

    long countByCourseIdAndActiveTrue(Long courseId);
}