package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Challenge;
import com.unimar.plataforma_educativa_angular.entities.ChallengeSubmission;
import com.unimar.plataforma_educativa_angular.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {

    List<ChallengeSubmission> findByChallenge(Challenge challenge);

    List<ChallengeSubmission> findByChallengeId(Long challengeId);

    List<ChallengeSubmission> findByStudent(User student);

    List<ChallengeSubmission> findByStudentId(Long studentId);

    Optional<ChallengeSubmission> findByChallengeAndStudent(Challenge challenge, User student);

    Optional<ChallengeSubmission> findByChallengeIdAndStudentId(Long challengeId, Long studentId);

    List<ChallengeSubmission> findByStatus(ChallengeSubmission.SubmissionStatus status);

    long countByChallengeId(Long challengeId);

    long countByStudentIdAndStatus(Long studentId, ChallengeSubmission.SubmissionStatus status);

    boolean existsByChallengeIdAndStudentId(Long challengeId, Long studentId);
}