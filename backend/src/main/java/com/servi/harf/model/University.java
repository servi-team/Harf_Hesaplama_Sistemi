package com.servi.harf.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "universities")
public class University extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String shortCode; // ITU, YTU, BOUN

    @Column(name = "logo_url")
    private String logoUrl;

    @OneToMany(mappedBy = "university")
    private List<Faculty> faculties = new ArrayList<>();
}
