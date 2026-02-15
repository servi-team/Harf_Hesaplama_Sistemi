package com.servi.harf.dto;

import java.util.List;

public record OfferingDto(
        Long id,
        String instructorName,
        String term,
        List<AssessmentDto> assessments,
        List<GradeScaleDto> gradeScales) {
}
