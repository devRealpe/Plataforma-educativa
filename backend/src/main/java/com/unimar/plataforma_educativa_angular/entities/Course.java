package com.unimar.plataforma_educativa_angular.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String level;

    @Column(unique = true, nullable = false)
    private String inviteCode;

    // ========================================
    // ✅ NUEVO: Enlace de grupo de WhatsApp
    // ========================================
    @Column(name = "whatsapp_link", length = 500)
    private String whatsappLink;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    @JsonIgnoreProperties({ "password", "courses" })
    private User teacher;

    @ManyToMany
    @JoinTable(name = "course_students", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    @JsonIgnoreProperties({ "password", "enrolledCourses" })
    private Set<User> students = new HashSet<>();

    // ========================================
    // Getters y Setters
    // ========================================

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

    // ✅ NUEVO Getter/Setter
    public String getWhatsappLink() {
        return whatsappLink;
    }

    public void setWhatsappLink(String whatsappLink) {
        this.whatsappLink = whatsappLink;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public Set<User> getStudents() {
        return students;
    }

    public void setStudents(Set<User> students) {
        this.students = students;
    }

    // ========================================
    // ✅ NUEVO: Métodos de utilidad
    // ========================================

    /**
     * Verifica si el curso tiene un enlace de WhatsApp configurado
     */
    public boolean hasWhatsappLink() {
        return whatsappLink != null && !whatsappLink.trim().isEmpty();
    }

    /**
     * Valida que el enlace sea de WhatsApp
     */
    public boolean isValidWhatsappLink() {
        if (whatsappLink == null || whatsappLink.trim().isEmpty()) {
            return false;
        }

        String link = whatsappLink.trim().toLowerCase();
        return link.startsWith("https://chat.whatsapp.com/") ||
                link.startsWith("https://wa.me/");
    }
}