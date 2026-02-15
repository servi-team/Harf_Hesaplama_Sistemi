package com.servi.harf.dto;

public record GradeScaleDto(
        Long id,
        String letter,
        Double minScore,
        Double maxScore,
        Double gpaPoint) {
}
