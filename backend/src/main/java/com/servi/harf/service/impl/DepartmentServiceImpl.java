package com.servi.harf.service.impl;

import com.servi.harf.dto.CourseDto;
import com.servi.harf.dto.DepartmentDto;
import com.servi.harf.dto.SemesterDto;
import com.servi.harf.model.Course;
import com.servi.harf.model.Department;
import com.servi.harf.model.Semester;
import com.servi.harf.repository.DepartmentRepository;
import com.servi.harf.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        // Not: Burada Semesterları da içeren daha kompleks bir DTO'ya ihtiyaç olabilir.
        // Şimdilik sadece temel bilgileri dönüyor.
        return departmentRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    private DepartmentDto mapToDto(Department department) {
        return new DepartmentDto(
                department.getId(),
                department.getName(),
                department.getCode()
        // Semester listesi ayrı bir servisten veya genişletilmiş DTO ile çekilebilir
        );
    }
}
