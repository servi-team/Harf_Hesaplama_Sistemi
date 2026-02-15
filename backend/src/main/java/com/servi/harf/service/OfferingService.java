package com.servi.harf.service;

import com.servi.harf.dto.OfferingDto;
import java.util.Optional;

public interface OfferingService {
    OfferingDto getOfferingByCourseAndTerm(Long courseId, String term);
}
