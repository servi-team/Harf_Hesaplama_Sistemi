package com.servi.harf.service;

import com.servi.harf.dto.DepartmentDto;
import com.servi.harf.dto.SemesterDto; // Bunu oluşturmadık ama lazım olacak
import java.util.List;

public interface DepartmentService {
    // Şuanlık sadece ID ile detaya ihtiyacımız olabilir
    DepartmentDto getDepartmentById(Long id);
}
