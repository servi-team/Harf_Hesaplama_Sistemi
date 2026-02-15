package com.servi.harf.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "assessments")
public class Assessment extends BaseEntity {

    @Column(nullable = false)
    private String name; // Vize, Final

    @Column(nullable = false)
    private Integer weight; // 40, 60

    @Column(name = "display_order")
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private Offering offering;
}
