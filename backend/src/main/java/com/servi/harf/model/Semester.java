package com.servi.harf.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "semesters")
public class Semester extends BaseEntity {

    @Column(nullable = false)
    private String name; // 1. Sınıf Güz

    @Column(name = "semester_number", nullable = false)
    private Integer number; // 1, 2, 3...

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @OneToMany(mappedBy = "semester")
    private List<Course> courses = new ArrayList<>();
}
