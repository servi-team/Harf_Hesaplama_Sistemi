package com.servi.harf.service;

import com.servi.harf.dto.UniversityDto;
import java.util.List;

public interface UniversityService {
    List<UniversityDto> getAllUniversities();

    UniversityDto getUniversityById(Long id);
}
