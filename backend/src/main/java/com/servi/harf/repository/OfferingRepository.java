package com.servi.harf.repository;

import com.servi.harf.model.Offering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferingRepository extends JpaRepository<Offering, Long> {
    List<Offering> findByCourseId(Long courseId);

    Optional<Offering> findByCourseIdAndTermAndIsActiveTrue(Long courseId, String term);
}
