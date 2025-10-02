package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Course;
import com.unimar.plataforma_educativa_angular.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByInviteCode(String inviteCode);

    Optional<Course> findByInviteCode(String inviteCode);

    // ✅ Nuevo: Buscar cursos por profesor
    List<Course> findByTeacher(User teacher);
}