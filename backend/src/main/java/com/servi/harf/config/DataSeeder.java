package com.servi.harf.config;

import com.servi.harf.model.*;
import com.servi.harf.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository; // Bunu repo klasöründe oluşturmamıştık ama lazım
    private final CourseRepository courseRepository;
    private final OfferingRepository offeringRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (universityRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        // İTÜ Ekleme
        University itu = new University();
        itu.setName("İstanbul Teknik Üniversitesi");
        itu.setShortCode("ITU");
        itu.setLogoUrl("");
        universityRepository.save(itu);

        Faculty ituBilgisayarFak = new Faculty();
        ituBilgisayarFak.setName("Bilgisayar ve Bilişim Fakültesi");
        ituBilgisayarFak.setUniversity(itu);
        facultyRepository.save(ituBilgisayarFak);

        Department ituBilgisayarBol = new Department();
        ituBilgisayarBol.setName("Bilgisayar Mühendisliği");
        ituBilgisayarBol.setCode("BLG");
        ituBilgisayarBol.setFaculty(ituBilgisayarFak);
        departmentRepository.save(ituBilgisayarBol);

        // İTÜ 1. Dönem
        Semester ituSem1 = new Semester();
        ituSem1.setName("1. Sınıf Güz");
        ituSem1.setNumber(1);
        ituSem1.setDepartment(ituBilgisayarBol);
        semesterRepository.save(ituSem1);

        Course blg101 = new Course();
        blg101.setCode("BLG 101");
        blg101.setName("Bilgisayar Mühendisliğine Giriş");
        blg101.setEcts(4);
        blg101.setCredit(3);
        blg101.setSemester(ituSem1);
        courseRepository.save(blg101);

        // YTÜ Ekleme
        University ytu = new University();
        ytu.setName("Yıldız Teknik Üniversitesi");
        ytu.setShortCode("YTU");
        ytu.setLogoUrl("");
        universityRepository.save(ytu);

        Faculty ytuElektrikFak = new Faculty();
        ytuElektrikFak.setName("Elektrik-Elektronik Fakültesi");
        ytuElektrikFak.setUniversity(ytu);
        facultyRepository.save(ytuElektrikFak);

        Department ytuBilgisayarBol = new Department();
        ytuBilgisayarBol.setName("Bilgisayar Mühendisliği");
        ytuBilgisayarBol.setCode("BLG");
        ytuBilgisayarBol.setFaculty(ytuElektrikFak);
        departmentRepository.save(ytuBilgisayarBol);

        System.out.println("✅ Data Seeding Completed: ITÜ ve YTÜ eklendi.");
    }
}
