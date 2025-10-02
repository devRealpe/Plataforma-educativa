package com.unimar.plataforma_educativa_angular.repositories;

import com.unimar.plataforma_educativa_angular.entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
