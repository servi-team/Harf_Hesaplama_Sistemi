package com.servi.harf.dto;

import java.util.List;

public record FacultyDto(
    Long id,
    String name,
    List<DepartmentDto> departments
) {}
