package com.unimar.plataforma_educativa_angular.dto;

import com.unimar.plataforma_educativa_angular.entities.Course;

public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private String level;
    private String inviteCode;
    private String teacherName;
    private String teacherEmail;
    private int studentCount;

    // Constructor vacío
    public CourseDTO() {
    }

    // Constructor que convierte Course a DTO
    public CourseDTO(Course course) {
        this.id = course.getId();
        this.title = course.getTitle();
        this.description = course.getDescription();
        this.level = course.getLevel();
        this.inviteCode = course.getInviteCode();

        if (course.getTeacher() != null) {
            this.teacherName = course.getTeacher().getNombre();
            this.teacherEmail = course.getTeacher().getEmail();
        }

        if (course.getStudents() != null) {
            this.studentCount = course.getStudents().size();
        }
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }

    public int getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(int studentCount) {
        this.studentCount = studentCount;
    }
}