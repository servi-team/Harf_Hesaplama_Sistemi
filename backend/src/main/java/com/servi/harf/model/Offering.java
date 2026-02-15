package com.servi.harf.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "offerings")
public class Offering extends BaseEntity {

    @Column(name = "instructor_name", nullable = false)
    private String instructorName;

    @Column(nullable = false)
    private String term; // 2025-Spring

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "offering", cascade = CascadeType.ALL)
    private List<Assessment> assessments = new ArrayList<>();

    @OneToMany(mappedBy = "offering", cascade = CascadeType.ALL)
    private List<GradeScale> gradeScales = new ArrayList<>();
}
