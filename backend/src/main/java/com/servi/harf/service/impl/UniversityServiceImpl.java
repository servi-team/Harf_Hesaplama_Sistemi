package com.servi.harf.service.impl;

import com.servi.harf.dto.DepartmentDto;
import com.servi.harf.dto.FacultyDto;
import com.servi.harf.dto.UniversityDto;
import com.servi.harf.model.Department;
import com.servi.harf.model.Faculty;
import com.servi.harf.model.University;
import com.servi.harf.repository.UniversityRepository;
import com.servi.harf.service.UniversityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UniversityServiceImpl implements UniversityService {

    private final UniversityRepository universityRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UniversityDto> getAllUniversities() {
        return universityRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UniversityDto getUniversityById(Long id) {
        return universityRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("University not found"));
    }

    private UniversityDto mapToDto(University university) {
        List<FacultyDto> facultyDtos = university.getFaculties().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new UniversityDto(
                university.getId(),
                university.getName(),
                university.getShortCode(),
                university.getLogoUrl(),
                facultyDtos);
    }

    private FacultyDto mapToDto(Faculty faculty) {
        List<DepartmentDto> departmentDtos = faculty.getDepartments().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new FacultyDto(
                faculty.getId(),
                faculty.getName(),
                departmentDtos);
    }

    private DepartmentDto mapToDto(Department department) {
        return new DepartmentDto(
                department.getId(),
                department.getName(),
                department.getCode());
    }
}
