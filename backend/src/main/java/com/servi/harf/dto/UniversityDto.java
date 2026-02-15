package com.servi.harf.dto;

import java.util.List;

public record UniversityDto(
    Long id,
    String name,
    String shortCode,
    String logoUrl,
    List<FacultyDto> faculties
) {}
