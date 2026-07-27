package com.servi.harf.dto;

import java.util.List;

public record SemesterDto(
    Long id,
    String name,
    Integer number,
    List<CourseDto> courses
) {}
