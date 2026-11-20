package com.sms.repository;

import com.sms.model.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByStudentIdNumber(String studentIdNumber);
    boolean existsByStudentIdNumber(String studentIdNumber);
    Page<StudentProfile> findAllByOrderByTotalPointsDesc(Pageable pageable);
}

