package com.servi.harf.service.impl;

import com.servi.harf.dto.AssessmentDto;
import com.servi.harf.dto.GradeScaleDto;
import com.servi.harf.dto.OfferingDto;
import com.servi.harf.model.Assessment;
import com.servi.harf.model.GradeScale;
import com.servi.harf.model.Offering;
import com.servi.harf.repository.OfferingRepository;
import com.servi.harf.service.OfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferingServiceImpl implements OfferingService {

    private final OfferingRepository offeringRepository;

    @Override
    @Transactional(readOnly = true)
    public OfferingDto getOfferingByCourseAndTerm(Long courseId, String term) {
        return offeringRepository.findByCourseIdAndTermAndIsActiveTrue(courseId, term)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Offering not found for course " + courseId + " term " + term));
    }

    private OfferingDto mapToDto(Offering offering) {
        List<AssessmentDto> assessmentDtos = offering.getAssessments().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        List<GradeScaleDto> gradeScaleDtos = offering.getGradeScales().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new OfferingDto(
                offering.getId(),
                offering.getInstructorName(),
                offering.getTerm(),
                assessmentDtos,
                gradeScaleDtos);
    }

    private AssessmentDto mapToDto(Assessment assessment) {
        return new AssessmentDto(
                assessment.getId(),
                assessment.getName(),
                assessment.getWeight(),
                assessment.getOrder());
    }

    private GradeScaleDto mapToDto(GradeScale gradeScale) {
        return new GradeScaleDto(
                gradeScale.getId(),
                gradeScale.getLetter(),
                gradeScale.getMinScore(),
                gradeScale.getMaxScore(),
                gradeScale.getGpaPoint());
    }
}
