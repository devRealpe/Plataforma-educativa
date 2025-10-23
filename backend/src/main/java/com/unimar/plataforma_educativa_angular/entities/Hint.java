package com.unimar.plataforma_educativa_angular.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(name = "hint_order", nullable = false)
    private Integer order;

    @Column(nullable = false)
    private Integer cost;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    @JsonIgnoreProperties({ "hints", "submissions", "course" })
    private Exercise exercise;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}