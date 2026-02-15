package com.servi.harf.dto;

public record CourseDto(
        Long id,
        String code,
        String name,
        Integer ects,
        Integer credit) {
}
